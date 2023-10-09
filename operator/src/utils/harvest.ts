import { BigNumber, Contract } from "ethers";
import wallet from "../config/wallet";
import getParaswapData from "./getParaswapData";
import ERC20_ABI from "../abi/ERC20.json";
import VAULT_ABI from "../abi/Vault.json";
import STAKER_ABI from "../abi/Staker.json";
import checkGasPrice from "./checkGasPrice";

const harvest = async (
  vaultAddress: string,
  stakerAddress: string,
  maxGasPrice: number,
  slippage: number,
  tokensToHarvest: string[],
  execute: boolean = true
) => {
  const provider = wallet.provider;

  const gasPrice = await checkGasPrice(maxGasPrice);

  // Create staker & vault contract
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);
  const staker = new Contract(stakerAddress, STAKER_ABI, provider);

  // Get claimable rewards
  let claimableRewards: any = [];
  try {
    claimableRewards = await staker.getUserTotalClaimableRewards(vaultAddress);
    console.log(`Claimable rewards: ${claimableRewards}`);
  } catch (err: any) {
    throw new Error(`Rpc call failed: ${err.message}`);
  }

  let feeToken: string;
  let asset: string;
  try {
    feeToken = await vault.feeToken();
    asset = await vault.asset();
  } catch (err: any) {
    throw new Error(`Rpc call failed: ${err.message}`);
  }

  const tokens: any = [];
  for (const reward of tokensToHarvest) {
    if (
      tokens.indexOf(reward) === -1 &&
      reward !== asset &&
      reward !== feeToken &&
      claimableRewards.find((c: any) => c[0] === reward)[1] > 0
    )
      tokens.push(claimableRewards.find((c: any) => c[0] === reward));
  }

  // Check if there are rewards to harvest
  if (tokensToHarvest.length === 0) {
    throw new Error("No rewards to harvest");
  }

  // Get input data
  const inputData: string[] = [];
  try {
    const chainId = (await provider.getNetwork()).chainId;
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
        chainId,
        slippage,
        vaultAddress
      );
      inputData.push(data);
    }
  } catch (err: any) {
    throw new Error(`Cannot get input data: ${err.message}`);
  }

  if (!execute) {
    const calldata = vault.interface.encodeFunctionData("harvest", [
      tokensToHarvest,
      tokens.map((token: any) => token[0]),
      inputData,
    ]);
    console.log(tokensToHarvest,
      tokens.map((token: any) => token[0]),
      inputData);
  } else {
    try {
      // Harvest the rewards
      const tx = await vault.harvest(
        tokensToHarvest,
        tokens.map((token: any) => token[0]),
        inputData,
        { gasPrice: BigNumber.from(gasPrice).mul(10000000000) }
      );

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error(`Transaction reverted: ${tx.hash}`);
      }
    } catch (err: any) {
      throw new Error(`Cannot harvest: ${err.message}`);
    }
  }
};

export default harvest;
