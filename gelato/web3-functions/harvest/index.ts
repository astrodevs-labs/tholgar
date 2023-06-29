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
  "function decimals() view returns (uint8)"
];

async function getParaswapData(
  srcToken: string,
  srcDecimals: string,
  destToken: string,
  destDecimals: string,
  amount: BigNumber,
  userAddress: string,
  chainId: number
): Promise<string> {
  try {
    const priceRoute: any = await ky
      .get(
        `https://apiv5.paraswap.io/prices?srcToken=${srcToken}&destToken=${destToken}&amount=${amount.toString()}&side=SELL&network=${chainId}&srcDecimals=${srcDecimals}&destDecimals=${destDecimals}&userAddress=${userAddress}`
      )
      .json();
    if (!priceRoute["priceRoute"]) {
      throw new Error("No price route found");
    }

    const priceData: any = await ky
      .post(
        `https://apiv5.paraswap.io/transactions/${chainId}?ignoreChecks=true&ignoreGasEstimate=true`,
        {
          json: {
            srcToken: priceRoute["priceRoute"].srcToken,
            destToken: priceRoute["priceRoute"].destToken,
            srcAmount: priceRoute["priceRoute"].srcAmount,
            destAmount: BigNumber.from(priceRoute["priceRoute"].srcAmount).sub(BigNumber.from(priceRoute["priceRoute"].srcAmount).div(100).mul(2)),
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
    return priceData["data"];
  } catch (error) {
    throw new Error(error.message);
  }
}

async function checkRevert(provider: any, secrets: any): Promise<number> {
  try {
    const taskId = await secrets.get("TASK_ID");
    if (!taskId) {
      throw new Error("No task id found");
    }

    const taskStatus: any = await ky
      .get(
        `https://api.gelato.digital/tasks/web3functions/networks/${provider.network.chainId}/tasks/${taskId}/status`
      )
      .json();
    if (!taskStatus["task"]["lastExecTransactionHash"]) {
      return 42;
    }

    const txHash = taskStatus["task"]["lastExecTransactionHash"];
    const txReceipt: any = await provider.getTransactionReceipt(txHash);
    return txReceipt["status"];
  } catch (error) {
    throw new Error(error.message);
  }
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage, multiChainProvider, secrets, gelatoArgs } = context;

  const provider = multiChainProvider.default();

  try {
    const status = await checkRevert(provider, secrets);
    if (status === 1) {
      // Change the pending to last timestamp
      const pendingLastTimestampStr = await storage.get("pendingLastTimestamp");
      if (pendingLastTimestampStr) {
        await storage.set("lastTimestamp", pendingLastTimestampStr);
        await storage.delete("pendingLastTimestamp");
      }
    } else if (status === 0) {
      await storage.delete("pendingLastTimestamp");
    }
  } catch (error) {
    return { canExec: false, message: error.message };
  }

  // Retrieve last timestamp of execution
  const currentTimestamp = new Date().getTime();
  const lastTimestampStr = await storage.get("lastTimestamp");
  if (!lastTimestampStr) {
    await storage.set("lastTimestamp", currentTimestamp.toString());
    return { canExec: false, message: "First execution" };
  }
  const lastTimestamp = parseInt(lastTimestampStr);
  console.log(`Last timestamp: ${lastTimestamp}`);

  const timeToExecute = parseInt(
    (await secrets.get("TIME_TO_EXECUTE")) ?? "604800000"
  );

  console.log(`Gas price: ${gelatoArgs.gasPrice.toString()}`);
  const maxGasPriceStr = await secrets.get("MAX_GAS_PRICE");
  const maxGasPrice = maxGasPriceStr
    ? maxGasPriceStr
    : "100";

    if (gelatoArgs.gasPrice.gt(maxGasPrice)) {
      return {
        canExec: false,
        message: "Gas price is too high",
      };
    }


  // Create staker & vault contract
  const vaultAddress =
    (userArgs.vault as string) ?? "0x28d00c740b511787659b341c1f476e33847d56b9";
  const stakerAddress =
    (userArgs.staker as string) ?? "0xA86c53AF3aadF20bE5d7a8136ACfdbC4B074758A";
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);
  const staker = new Contract(stakerAddress, STAKER_ABI, provider);

  // Check if enough time has passed since last execution
  const timeSinceLastExecution = currentTimestamp - lastTimestamp;
  console.log(`Time since last execution: ${timeSinceLastExecution}`);
  if (timeSinceLastExecution < timeToExecute) {
    return {
      canExec: false,
      message: "Not enough time has passed since last execution",
    };
  }

  let claimableRewards: any = [];
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

  const tokens: any = [];

  for (const reward of claimableRewards) {
    if (tokens.indexOf(reward) === -1) tokens.push(reward);
  }

  const inputData: string[] = [];
  try {
    const feeToken = await vault.feeToken();
    const feeContract = new Contract(feeToken, ERC20_ABI, provider);
    const feeDecimals = await feeContract.decimals();
    for (const token of tokens) {
      const tokenContract = new Contract(token[0], ERC20_ABI, provider);
      const srcDecimals = await tokenContract.decimals();
      const data = await getParaswapData(
        token[0],
        srcDecimals,
        feeToken,
        feeDecimals,
        token[1],
        vaultAddress,
        provider.network.chainId
      );
      inputData.push(data);
    }
  } catch (err) {
    return { canExec: false, message: `Cannot get input data: ${err.message}` };
  }

  // Update storage for next run
  await storage.set("pendingLastTimestamp", currentTimestamp.toString());

  // Harvest the rewards
  return {
    canExec: true,
    callData: [
      {
        to: vaultAddress,
        data: vault.interface.encodeFunctionData("harvest", [
          tokens.map((token: any) => token[0]),
          inputData,
        ]),
      },
    ],
  };
});
