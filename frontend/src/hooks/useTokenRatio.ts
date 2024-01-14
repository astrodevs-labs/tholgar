import { useContractRead } from 'wagmi';
import { minterAddress, warRatioABI, warMinterABI } from '../config/blockchain';
import { useState } from 'react';

export default function useTokenRatio(tokenAddress: `0x${string}`): bigint | undefined {

  const [ratioAddress, setRatioAddress]  = useState<`0x${string}` | undefined>(undefined);

  const ratioAddressResult = useContractRead({
    address: minterAddress,
    abi: warMinterABI,
    functionName: 'ratios',
    enabled: !ratioAddress
  }).data as `0x${string}` | undefined;

  if (ratioAddressResult && ratioAddressResult !== ratioAddress) {
    setRatioAddress(ratioAddressResult);
  }

  return useContractRead({
    address: ratioAddress,
    abi: warRatioABI,
    functionName: 'getTokenRatio',
    args: [tokenAddress]
  }).data as bigint | undefined;
}
