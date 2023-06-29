import { Contract } from "ethers";
import wallet from "../config/wallet";
import getParaswapData from "./getParaswapData";
import ERC20_ABI from "../abi/ERC20.json";
import VAULT_ABI from "../abi/Vault.json";
import checkGasPrice from "./checkGasPrice";

const compound = async (vaultAddress: string, maxGasPrice: number, slippage: number) => {
  const provider = wallet.provider;

  await checkGasPrice(maxGasPrice);

  // Create vault contract
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);

  // Get swap data for fee token to mintable token
  const outputData: string[] = [];
  try {
    const feeToken = await vault.feeToken();
    const feeContract = new Contract(feeToken, ERC20_ABI, provider);
    const srcDecimals = await feeContract.decimals();
    const balance = await feeContract.balanceOf(vaultAddress);
    const outputTokens = await vault.getOutputTokenAddresses();
    const MAX_WEIGHT = await vault.MAX_WEIGHT();
    for (const token of outputTokens) {
      const ratio = await vault.getOutputTokenRatio(token);
      const tokenContract = new Contract(token, ERC20_ABI, provider);
      const destDecimals = await tokenContract.decimals();
      const amount = balance.mul(ratio.div(MAX_WEIGHT));
      const data = await getParaswapData(
        feeToken,
        srcDecimals,
        token,
        destDecimals,
        amount,
        vaultAddress,
        (await provider.getNetwork()).chainId,
        slippage
      );
      outputData.push(data[0]);
    }
  } catch (err) {
    throw new Error(`Cannot get output data: ${err.message}`);
  }

  // Compound the rewards
  await vault.harvest(outputData);
};

export default compound;
