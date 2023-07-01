import { ethers } from "ethers";
import "dotenv/config";

if (!process.env.JSON_RPC_URL) {
  throw new Error("JSON_RPC_URL is not defined");
}
const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_URL);

export default provider;
