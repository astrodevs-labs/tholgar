import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "ethers";

const STAKER_ABI = [{
  "inputs": [
    {
      "internalType": "address",
      "name": "user",
      "type": "address"
    }
  ],
  "name": "getUserTotalClaimableRewards",
  "outputs": [
    {
      "components": [
        {
          "internalType": "address",
          "name": "reward",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "claimableAmount",
          "type": "uint256"
        }
      ],
      "internalType": "struct WarStaker.UserClaimableRewards[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},];
const VAULT_ABI = ["function harvest()"];

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage, multiChainProvider } = context;

  const provider = multiChainProvider.default();

  const timeToExecute = (userArgs.timeToExecute as number) ?? 604800000;

  // Create staker & vault contract
  const vaultAddress =
    (userArgs.vault as string) ?? "0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da";
  const stakerAddress =
    (userArgs.staker as string) ??
    "0xA86c53AF3aadF20bE5d7a8136ACfdbC4B074758A";
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);
  const staker = new Contract(stakerAddress, STAKER_ABI, provider);
  const currentTimestamp = (new Date()).getTime();

  // Retrieve last timestamp of execution
  const lastTimestampStr = await storage.get("lastTimestamp");
  if (!lastTimestampStr) {
    await storage.set("lastTimestamp", currentTimestamp.toString());
    return { canExec: false, message: "First execution" };
  }
  let lastTimestamp = parseInt(lastTimestampStr);
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


  try {
    const claimableRewards = await staker.getUserTotalClaimableRewards(vaultAddress);
    console.log(`Claimable rewards: ${claimableRewards}`);

    // Check if there are rewards to harvest
    if (claimableRewards.length === 0) {
      return { canExec: false, message: "No rewards to harvest" };
    }
  } catch (err) {
    return { canExec: false, message: `Rpc call failed: ${err.message}` };
  }


  // Update storage for next run
  await storage.set("lastTimestamp", currentTimestamp.toString());

  // Harvest the rewards
  return {
    canExec: true,
    callData: [
      {
        to: vaultAddress,
        data: vault.interface.encodeFunctionData("harvest", []),
      },
    ],
  };
});
