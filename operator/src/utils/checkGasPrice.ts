import axios from "axios";
import config from "../config/config";

const checkGasPrice = async (maxGasPrice: number): Promise<number> => {
  const etherscanApiKey = config.etherscanApiKey();

  let gasPrice: number;
  try {
    const result: any = await axios.get(
      `${etherscanApiKey}/api?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`
    );
    gasPrice = parseFloat(result.result.SafeGasPrice);
  } catch (err: any) {
    throw new Error(`Cannot get gas price: ${err.message}`);
  }
  if (gasPrice > maxGasPrice) {
    throw new Error(`Gas price is too high: ${gasPrice}`);
  }
  return gasPrice;
};

export default checkGasPrice;
