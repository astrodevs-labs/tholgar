import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract } from "ethers";
import { Log } from "@ethersproject/providers";
import ky from "ky";

const MAX_RANGE = 100; // limit range of events to comply with rpc providers
const MAX_REQUESTS = 100; // limit number of requests on every execution to avoid hitting timeout
const VAULT_ABI = [
  {
    inputs: [],
    name: "getOutputTokenAddresses",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_WEIGHT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getOutputTokenRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "inputTokens",
        type: "address[]",
      },
      {
        internalType: "bytes[]",
        name: "inputCallDatas",
        type: "bytes[]",
      },
      {
        internalType: "bytes[]",
        name: "outputCallDatas",
        type: "bytes[]",
      },
    ],
    name: "compound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "reward",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct IStaker.UserClaimedRewards[]",
        name: "rewards",
        type: "tuple[]",
      },
    ],
    name: "Harvested",
    type: "event",
  },
];
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

async function getParaswapData(
  srcToken: string,
  srcDecimals: string,
  destToken: string,
  destDecimals: string,
  amount: BigNumber,
  userAddress: string,
  simulate = true
): Promise<[string, string]> {
  const priceRoute = await ky
    .get(
      `https://apiv5.paraswap.io/prices?from=${srcToken}&to=${destToken}&amount=${amount.toString()}&side=SELL&network=${
        provider.network.chainId
      }&srcDecimals=${srcDecimals}&destDecimals=${destDecimals}`
    )
    .json();
  if (!priceRoute["priceRoute"]) {
    throw new Error("No price route found");
  }

  const priceData = await ky
    .post(
      `https://apiv5.paraswap.io/transactions/${provider.network.chainId}?ignoreChecks=${simulate}`,
      {
        timeout: 5_000,
        retry: 0,
        json: {
          srcToken: priceRoute["priceRoute"].srcToken,
          destToken: priceRoute["priceRoute"].destToken,
          srcAmount: priceRoute["priceRoute"].srcAmount,
          destAmount: priceRoute["priceRoute"].destAmount,
          priceRoute: priceRoute["priceRoute"],
          userAddress: userAddress,
          partner: "paraswap.io",
          srcDecimals: priceRoute["priceRoute"].srcDecimals,
          destDecimals: priceRoute["priceRoute"].destDecimals,
        },
      }
    )
    .json();
  if (!priceData["data"]) {
    throw new Error("No data returned from Paraswap");
  }
  return [priceData["data"], priceRoute["priceRoute"].destAmount];
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage, multiChainProvider } = context;

  const provider = multiChainProvider.default();

  // Create vault contract
  const vaultAddress =
    (userArgs.vault as string) ?? "0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da";
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);
  const topics = [vault.interface.getEventTopic("Harvested")];
  const currentBlock = await provider.getBlockNumber();

  // Retrieve last timestamp of execution
  const lastBlockStr = await storage.get("lastBlock");
  if (!lastBlockStr) {
    await storage.set("lastBlock", currentBlock.toString());
    return { canExec: false, message: "First execution" };
  }
  let lastBlock = parseInt(lastBlockStr);
  console.log(`Last block: ${lastBlock}`);

  // Fetch recent logs in range of 100 blocks
  const logs: Log[] = [];
  let nbRequests = 0;
  while (lastBlock < currentBlock && nbRequests < MAX_REQUESTS) {
    nbRequests++;
    const fromBlock = lastBlock + 1;
    const toBlock = Math.min(fromBlock + MAX_RANGE, currentBlock);
    console.log(`Fetching log events from blocks ${fromBlock} to ${toBlock}`);
    try {
      const eventFilter = {
        address: vaultAddress,
        topics,
        fromBlock,
        toBlock,
      };
      const result = await provider.getLogs(eventFilter);
      logs.push(...result);
      lastBlock = toBlock;
    } catch (err) {
      return { canExec: false, message: `Rpc call failed: ${err.message}` };
    }
  }

  // Update storage for next run
  await storage.set("lastBlock", currentBlock.toString());

  if (logs.length === 0) {
    return { canExec: false, message: "No new rewards" };
  }

  const tokens: string[] = [];

  for (const log of logs) {
    const parsedLog = vault.interface.parseLog(log);
    const rewards = parsedLog.args.rewards;
    for (const reward of rewards) {
      if (tokens.indexOf(reward.reward) === -1) tokens.push(reward.reward);
    }
  }

  // Get swap data for rewards token to fee token
  const inputData = [];
  const totalOut = BigNumber.from(0);
  try {
    const feeToken = await vault.feeToken();
    const feeContract = new Contract(feeToken, ERC20_ABI, provider);
    for (const token of tokens) {
      const tokenContract = new Contract(token, ERC20_ABI, provider);
      const balance = await tokenContract.getBalanceOf(token);
      const srcDecimals = await tokenContract.decimals();
      const destDecimals = await feeContract.decimals();
      const data = await getParaswapData(
        token,
        srcDecimals,
        feeToken,
        destDecimals,
        balance,
        vaultAddress
      );
      inputData.push(data[0]);
      totalOut.add(data[1]);
    }
  } catch (err) {
    return { canExec: false, message: `Cannot get input data: ${err.message}` };
  }

  // Get swap data for fee token to mintable token
  const outputData = [];
  try {
    const feeToken = await vault.feeToken();
    const feeContract = new Contract(feeToken, ERC20_ABI, provider);
    const outputTokens = await vault.getOutputTokenAddresses();
    const MAX_WEIGHT = await vault.MAX_WEIGHT();
    for (const token of outputTokens) {
      const ratio = await vault.getOutputTokenRatio(token);
      const tokenContract = new Contract(token, ERC20_ABI, provider);
      const srcDecimals = await feeContract.decimals();
      const destDecimals = await tokenContract.decimals();
      const amount = totalOut.mul(ratio.div(MAX_WEIGHT));
      const data = await getParaswapData(
        feeToken,
        srcDecimals,
        token,
        destDecimals,
        amount,
        vaultAddress,
        false
      );
      outputData.push(data[0]);
    }
  } catch (err) {
    return {
      canExec: false,
      message: `Cannot get output data: ${err.message}`,
    };
  }

  // Compound the rewards
  return {
    canExec: true,
    callData: [
      {
        to: vaultAddress,
        data: vault.interface.encodeFunctionData("compound", [
          tokens,
          inputData,
          outputData,
        ]),
      },
    ],
  };
});
