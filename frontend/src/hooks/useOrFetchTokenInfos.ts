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
    address: tokenInfos?.decimals || tokenInfos?.totalSupply ? undefined : addressToUse
  });

  useEffect(() => {
    if (tokenInfos && data) {
      useStore.getState().setTokenInfos(tokenInfos?.id, data);
    }
  }, [token, data]);
  return tokenInfos;
}
