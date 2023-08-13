import { stakerAddress, warStakerABI } from 'config/blockchain';
import { useContractRead } from 'wagmi';

export const useFetchRewardStates = (tokenAddress: `0x${string}`, active = true): bigint[] | undefined => {
  return useContractRead({
    address: active ? stakerAddress : undefined,
    abi: warStakerABI,
    functionName: 'rewardStates',
    args: [tokenAddress]
  }).data as bigint[] | undefined;
};
