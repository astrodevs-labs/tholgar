import { ethers } from "ethers";
import etherProvider from "./etherProvider";
import config from "./config";

const privateKey = config.privateKey();
const wallet = new ethers.Wallet(privateKey, etherProvider);

export default wallet;
