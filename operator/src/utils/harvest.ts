import { Contract } from "ethers";
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
  slippage: number
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
  } catch (err) {
    throw new Error(`Rpc call failed: ${err.message}`);
  }

  const tokens: any = [];
  for (const reward of claimableRewards) {
    if (
      tokens.indexOf(reward) === -1 &&
      !(await vault.tokensToHarvest(tokens[0]))
    )
      tokens.push(reward);
  }

  // Check if there are rewards to harvest
  if (tokens.length === 0) {
    throw new Error("No rewards to harvest");
  }

  // Get input data
  const inputData: string[] = [];
  try {
    const chainId = (await provider.getNetwork()).chainId;
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
        chainId,
        slippage
      );
      inputData.push(data);
    }
  } catch (err) {
    throw new Error(`Cannot get input data: ${err.message}`);
  }

  try {
    // Harvest the rewards
    const tx = await vault.harvest(
      tokens.map((token: any) => token[0]),
      inputData,
      { gasLimit: gasPrice * 10000000000 }
    );

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error(`Transaction reverted: ${tx.hash}`);
    }
  } catch (err) {
    throw new Error(`Cannot harvest: ${err.message}`);
  }
};

export default harvest;
