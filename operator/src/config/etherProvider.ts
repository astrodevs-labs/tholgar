import { ethers } from "ethers";
import config from "./config";

const jsonRpcUrl = config.jsonRpcUrl();
const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);

export default provider;
