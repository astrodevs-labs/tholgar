import { ethers } from 'ethers';
import 'dotenv/config';
import etherProvider from './etherProvider';

if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in .env file');
}
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, etherProvider);

export default wallet;