import ky from "ky";
import 'dotenv/config';

const checkGasPrice = async (maxGasPrice: number) => {
    if (!process.env.ETHERSCAN_API_KEY) {
        throw new Error("ETHERSCAN_API_KEY not found in .env file");
    }
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

    let gasPrice: any;
    try {
        gasPrice = ky.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`).json();
    } catch (err) {
        throw new Error(`Cannot get gas price: ${err.message}`);
    }
    if (parseFloat(gasPrice.result.SafeGasPrice) > maxGasPrice) {
        throw new Error("Gas price too high");
    }
};

export default checkGasPrice;
