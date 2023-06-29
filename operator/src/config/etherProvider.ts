import { ethers } from 'ethers';
import 'dotenv/config';

const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_URL);

export default provider;