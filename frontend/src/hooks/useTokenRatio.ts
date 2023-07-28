import { useContractRead } from 'wagmi';
import { ratioAddress, warRatioABI } from '../config/blockchain';

export default function useTokenRatio(tokenAddress: `0x${string}`): bigint | undefined {
  return useContractRead({
    address: ratioAddress,
    abi: warRatioABI,
    functionName: 'getTokenRatio',
    args: [tokenAddress]
  }).data as bigint | undefined;
}
