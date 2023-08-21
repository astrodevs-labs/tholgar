import { BigNumber, Contract } from "ethers";
import wallet from "../config/wallet";
import getParaswapData from "./getParaswapData";
import ERC20_ABI from "../abi/ERC20.json";
import VAULT_ABI from "../abi/Vault.json";
import checkGasPrice from "./checkGasPrice";

const MAX_WEIGHT = 10000;

const compound = async (
  vaultAddress: string,
  maxGasPrice: number,
  slippage: number,
  ratios: Map<string, BigNumber>
) => {
  const provider = wallet.provider;

  const gasPrice = await checkGasPrice(maxGasPrice);

  // Create vault contract
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);

  // Get swap data for fee token to mintable token
  const outputData: string[] = [];
  const tokensToMint: string[] = [];
  const tokensToSwap: string[] = [];
  try {
    const chainId = (await provider.getNetwork()).chainId;
    const feeToken = await vault.feeToken();
    const feeContract = new Contract(feeToken, ERC20_ABI, provider);
    const srcDecimals = await feeContract.decimals();
    const balance = await feeContract.balanceOf(vaultAddress);

    for (let i = 0; i < ratios.size; i++) {
      tokensToSwap.push(feeToken);
    }
    for (const [key, _] of ratios) {
      tokensToMint.push(key);
    }

    for (const token of tokensToMint) {
      const tokenContract = new Contract(token, ERC20_ABI, provider);
      const destDecimals = await tokenContract.decimals();
      const amount = balance.mul(ratios.get(token)!.div(MAX_WEIGHT));
      const data = await getParaswapData(
        feeToken,
        srcDecimals,
        token,
        destDecimals,
        amount,
        vaultAddress,
        chainId,
        slippage,
        vaultAddress
      );
      outputData.push(data);
    }
  } catch (err: any) {
    throw new Error(`Cannot get output data: ${err.message}`);
  }

  try {
    // Compound the rewards
    const tx = await vault.compound(tokensToSwap, outputData, tokensToMint, {
      gasPrice: BigNumber.from(gasPrice).mul(10000000000),
    });

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error(`Transaction reverted: ${tx.hash}`);
    }
  } catch (err: any) {
    throw new Error(`Cannot compound: ${err.message}`);
  }
};

export default compound;
