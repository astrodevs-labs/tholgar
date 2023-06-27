import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract } from "ethers";
import { Log } from "@ethersproject/providers";
import ky from "ky";

const MAX_RANGE = 100; // limit range of events to comply with rpc providers
const MAX_REQUESTS = 80; // limit number of requests on every execution to avoid hitting timeout
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
  chainId: number
): Promise<[string, string]> {
  const priceRoute: any = await ky
    .get(
      `https://apiv5.paraswap.io/prices?from=${srcToken}&to=${destToken}&amount=${amount.toString()}&side=SELL&network=${chainId}&srcDecimals=${srcDecimals}&destDecimals=${destDecimals}`
    )
    .json();
  if (!priceRoute["priceRoute"]) {
    throw new Error("No price route found");
  }

  const priceData: any = await ky
    .post(`https://apiv5.paraswap.io/transactions/${chainId}`, {
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
    })
    .json();
  if (!priceData["data"]) {
    throw new Error("No data returned from Paraswap");
  }
  return [priceData["data"], priceRoute["priceRoute"].destAmount];
}

async function checkRevert(provider: any, secrets: any): Promise<number> {
  const taskId = await secrets.get("TASK_ID");
  if (!taskId) {
    throw new Error("No task id found");
  }

  const taskStatus: any = ky.get(`https://api.gelato.digital/tasks/web3functions/networks/${provider.network.chainId}/tasks/${taskId}/status`).json();
  if (!taskStatus["task"]["lastExecTransactionHash"]) {
    return 42;
  }

  const txHash = taskStatus["task"]["lastExecTransactionHash"];
  const txReceipt: any = await provider.getTransactionReceipt(txHash);
  return txReceipt["status"];
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage, multiChainProvider, secrets } = context;

  const provider = multiChainProvider.default();

  try {
    const status = await checkRevert(provider, secrets);
    if (status === 1) {
      // Change the pending to last timestamp
      const pendingLastBlockStr = await storage.get("pendingLastBlock");
      if (pendingLastBlockStr) {
        await storage.set("lastBlock", pendingLastBlockStr);
        await storage.delete("pendingLastBlock");
      }
    } else if (status === 0) {
      await storage.delete("pendingLastBlock");
    }
  } catch (error) {
    return { canExec: false, message: error.message };
  }

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
    await storage.set("execute", "false");
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

  const execute = await storage.get("execute") ?? "false";
  if (execute === "false" && logs.length === 0) {
    return { canExec: false, message: "No new rewards" };
  } else {
    await storage.set("execute", "true");
  }

  // Get swap data for fee token to mintable token
  const outputData: string[] = [];
  try {
    const feeToken = await vault.feeToken();
    const feeContract = new Contract(feeToken, ERC20_ABI, provider);
    const balance = await feeContract.balanceOf(vaultAddress);
    const outputTokens = await vault.getOutputTokenAddresses();
    const MAX_WEIGHT = await vault.MAX_WEIGHT();
    for (const token of outputTokens) {
      const ratio = await vault.getOutputTokenRatio(token);
      const tokenContract = new Contract(token, ERC20_ABI, provider);
      const srcDecimals = await feeContract.decimals();
      const destDecimals = await tokenContract.decimals();
      const amount = balance.mul(ratio.div(MAX_WEIGHT));
      const data = await getParaswapData(
        feeToken,
        srcDecimals,
        token,
        destDecimals,
        amount,
        vaultAddress,
        provider.network.chainId
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
        data: vault.interface.encodeFunctionData("compound", [outputData]),
      },
    ],
  };
});
