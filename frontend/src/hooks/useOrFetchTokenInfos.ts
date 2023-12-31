import { useStore } from '../store';
import { useEffect } from 'react';
import { useToken } from 'wagmi';
import { Token } from 'types/Token';

type TokenInfo = {
  decimals?: number;
  totalSupply?: bigint;
  symbol?: string;
  address: `0x${string}`;
};

export default function useOrFetchTokenInfos({
  token,
  address
}: {
  token?: Token;
  address?: `0x${string}`;
}): TokenInfo | undefined {
  if (!token && !address) {
    console.warn('useOrFetchTokenInfos: token and address are undefined');
    return undefined;
  }

  let addressToUse: `0x${string}` | undefined = address;
  const tokensInfos = useStore((state) => state.tokensInfos);
  const tokenInfos = token
    ? tokensInfos.find((tokenInfos) => tokenInfos.id === token)
    : tokensInfos.find((tokenInfos) => tokenInfos.address === address);

  if (addressToUse === undefined) {
    addressToUse = tokenInfos?.address;
  }

  const { data } = useToken({
    address: addressToUse,
    staleTime: 0,
    enabled:
      tokenInfos?.decimals === undefined ||
      tokenInfos?.totalSupply === undefined ||
      tokenInfos?.symbol === undefined
  });

  useEffect(() => {
    if (
      tokenInfos &&
      (tokenInfos.totalSupply === undefined ||
        tokenInfos.totalSupply !== data?.totalSupply.value ||
        tokenInfos?.decimals === undefined ||
        tokenInfos.symbol === undefined) &&
      data
    ) {
      useStore.getState().setTokenInfos(tokenInfos?.id, data);
    }
  }, [tokenInfos, data]);
  return tokenInfos;
}
