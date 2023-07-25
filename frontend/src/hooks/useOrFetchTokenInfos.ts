import { useStore } from '../store';
import { useEffect } from 'react';
import { useToken } from 'wagmi';
import {Token} from "types/Token";

export default function useOrFetchTokenInfos({token, address}: {token?: Token, address?: `0x${string}`}): number | undefined {
  if (!token && !address) {
    console.warn('useOrFetchTokenInfos: token and address are undefined')
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
    address: tokenInfos?.decimals ? undefined : addressToUse
  });

  useEffect(() => {
    if (tokenInfos?.decimals === undefined && data?.decimals !== undefined && tokenInfos) {
      useStore.getState().setTokenInfos(tokenInfos?.id, data.decimals);
    }
  }, [token, data]);
  return tokenInfos?.decimals;
}

