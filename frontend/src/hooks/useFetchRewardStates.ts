import { stakerAddress, warStakerABI } from 'config/blockchain';
import { useContractRead } from 'wagmi';

export const useFetchRewardStates = (tokenAddress: `0x${string}`): bigint[] | undefined => {
  return useContractRead({
    address: stakerAddress,
    abi: warStakerABI,
    functionName: 'rewardStates',
    args: [tokenAddress]
  }).data as bigint[] | undefined;
};
