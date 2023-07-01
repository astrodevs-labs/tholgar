import ky from "ky";
import "dotenv/config";

const checkGasPrice = async (maxGasPrice: number): Promise<number> => {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("ETHERSCAN_API_KEY not found in .env file");
  }
  const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

  let gasPrice: number;
  try {
    const result: any = await ky
      .get(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`
      )
      .json();
    gasPrice = parseFloat(result.result.SafeGasPrice);
  } catch (err) {
    throw new Error(`Cannot get gas price: ${err.message}`);
  }
  if (gasPrice > maxGasPrice) {
    throw new Error(`Gas price is too high: ${gasPrice}`);
  }
  return gasPrice;
};

export default checkGasPrice;
