import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract } from "ethers";
import ky from "ky";

const STAKER_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserTotalClaimableRewards",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "reward",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "claimableAmount",
            type: "uint256",
          },
        ],
        internalType: "struct WarStaker.UserClaimableRewards[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const VAULT_ABI = [
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
    ],
    name: "harvest",
    outputs: [],
    stateMutability: "nonpayable",
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

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage, multiChainProvider } = context;

  const provider = multiChainProvider.default();

  const timeToExecute = (userArgs.timeToExecute as number) ?? 604800000;

  // Create staker & vault contract
  const vaultAddress =
    (userArgs.vault as string) ?? "0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da";
  const stakerAddress =
    (userArgs.staker as string) ?? "0xA86c53AF3aadF20bE5d7a8136ACfdbC4B074758A";
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);
  const staker = new Contract(stakerAddress, STAKER_ABI, provider);
  const currentTimestamp = new Date().getTime();

  // Retrieve last timestamp of execution
  const lastTimestampStr = await storage.get("lastTimestamp");
  if (!lastTimestampStr) {
    await storage.set("lastTimestamp", currentTimestamp.toString());
    return { canExec: false, message: "First execution" };
  }
  const lastTimestamp = parseInt(lastTimestampStr);
  console.log(`Last timestamp: ${lastTimestamp}`);

  // Check if enough time has passed since last execution
  const timeSinceLastExecution = currentTimestamp - lastTimestamp;
  console.log(`Time since last execution: ${timeSinceLastExecution}`);
  if (timeSinceLastExecution < timeToExecute) {
    return {
      canExec: false,
      message: "Not enough time has passed since last execution",
    };
  }

  let claimableRewards: any;
  try {
    claimableRewards = await staker.getUserTotalClaimableRewards(vaultAddress);
    console.log(`Claimable rewards: ${claimableRewards}`);

    // Check if there are rewards to harvest
    if (claimableRewards.length === 0) {
      return { canExec: false, message: "No rewards to harvest" };
    }
  } catch (err) {
    return { canExec: false, message: `Rpc call failed: ${err.message}` };
  }

  const tokens: string[] = [];

  for (const reward of claimableRewards) {
    if (tokens.indexOf(reward[0]) === -1) tokens.push(reward[0]);
  }

  const inputData: string[] = [];
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
        vaultAddress,
        provider.network.chainId
      );
      inputData.push(data[0]);
      totalOut.add(data[1]);
    }
  } catch (err) {
    return { canExec: false, message: `Cannot get input data: ${err.message}` };
  }

  // Update storage for next run
  await storage.set("lastTimestamp", currentTimestamp.toString());

  // Harvest the rewards
  return {
    canExec: true,
    callData: [
      {
        to: vaultAddress,
        data: vault.interface.encodeFunctionData("harvest", [
          tokens,
          inputData,
        ]),
      },
    ],
  };
});
