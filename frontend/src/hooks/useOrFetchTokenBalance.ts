import { useStore } from '../store';
import { useEffect } from 'react';
import { Token } from 'types/Token';
import { useBalance } from 'wagmi';
import useConnectedAccount from './useConnectedAccount';

export default function useOrFetchTokenBalance({
  token,
  address,
  account
}: {
  token?: Token;
  address?: `0x${string}`;
  account?: `0x${string}`;
}): bigint | undefined {
  if (token === undefined && address === undefined) {
    console.warn('useOrFetchTokenBalance: token and address are undefined');
    return undefined;
  }
  const balance = useStore((state) =>
    token ? state.getTokenBalance(token) : state.getAddressBalance(address!)
  );

  let tokenAddress: `0x${string}` | undefined;
  if (token) {
    const tokensBalances = useStore((state) => state.tokensBalances);
    tokenAddress = tokensBalances.find((tokenBalance) => tokenBalance.id === token)?.address;
  } else {
    tokenAddress = address;
  }

  const { address: accountAddress } = useConnectedAccount();
  const newBalance = useBalance({
    token: tokenAddress,
    address: balance != undefined ? undefined : account != undefined ? account : accountAddress
  });

  useEffect(() => {
    if (balance === undefined || newBalance?.data?.value !== balance) {
      if (!newBalance.data || account !== undefined) return;
      if (token) useStore.getState().setTokenBalance(token, newBalance.data?.value);
      if (address) useStore.getState().setAddressBalance(address, newBalance.data?.value);
    }
  }, [token, address, balance, newBalance]);

  useEffect(() => {
    if (balance !== undefined && accountAddress == undefined) {
      if (token) useStore.getState().setTokenBalance(token, undefined);
      if (address) useStore.getState().setAddressBalance(address, undefined);
    }
  }, [accountAddress]);
  return balance || newBalance.data?.value;
}
