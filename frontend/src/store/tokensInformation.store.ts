import { StateCreator } from 'zustand';
import { Store } from './index';
import { auraAddress, cvxAddress, vaultAddress, warAddress } from '../config/blockchain';
import { Token } from 'types/Token';
import { FetchTokenResult } from '@wagmi/core';

interface TokenInfo {
  id: Token;
  address: `0x${string}`;
  decimals?: number;
  totalSupply?: bigint;
  symbol?: string;
}
export interface TokensInformationStore {
  tokensInfos: TokenInfo[];
  getTokenDecimals: (tokenId: Token) => number | undefined;
  getAddressDecimals: (address: string) => number | undefined;
  getTokenTotalSupply: (tokenId: Token) => bigint | undefined;
  getAddressTotalSupply: (address: string) => bigint | undefined;
  setTokensInfos: (balances: TokenInfo[]) => void;
  setTokenInfos: (token: Token, data: FetchTokenResult) => void;
  setAddressInfos: (address: string, data: FetchTokenResult) => void;
  resetTokenInfos: (token: Token) => void;
}

const defaultTokenInfos: TokenInfo[] = [
  {
    id: 'war',
    address: warAddress
  },
  {
    id: 'aura',
    address: auraAddress
  },
  {
    id: 'cvx',
    address: cvxAddress
  },
  {
    id: 'tWAR',
    address: vaultAddress
  }
];

export const createTokensInformationStore: StateCreator<Store, [], [], TokensInformationStore> = (
  set,
  get
) => ({
  tokensInfos: defaultTokenInfos,
  getTokenDecimals: (tokenId: Token) =>
    get().tokensInfos.find((tokenInfos) => tokenInfos.id === tokenId)?.decimals,
  getTokenTotalSupply: (tokenId: Token) =>
    get().tokensInfos.find((tokenInfos) => tokenInfos.id === tokenId)?.totalSupply,
  getAddressTotalSupply: (address: string) =>
    get().tokensInfos.find((tokenInfos) => tokenInfos.address === address)?.totalSupply,
  getAddressDecimals: (address: string) =>
    get().tokensInfos.find((tokenInfos) => tokenInfos.address === address)?.decimals,
  setTokensInfos: (infos: TokenInfo[]) => set((state: Store) => ({ ...state, tokensInfos: infos })),
  setTokenInfos: (token: Token, data: FetchTokenResult) =>
    set((state: Store) => ({
      ...state,
      tokensInfos: state.tokensInfos.map((tokenInfos) => {
        if (tokenInfos.id === token) {
          return {
            id: tokenInfos.id,
            address: tokenInfos.address,
            totalSupply: data.totalSupply.value,
            decimals: data.decimals,
            symbol: data.symbol
          };
        }
        return tokenInfos;
      })
    })),
  setAddressInfos: (address: string, data: FetchTokenResult) =>
    set((state: Store) => ({
      ...state,
      tokensInfos: state.tokensInfos.map((tokenInfos) => {
        if (tokenInfos.address === address) {
          return {
            ...tokenInfos,
            data
          };
        }
        return tokenInfos;
      })
    })),
  resetTokenInfos: (token: Token) => {
    set((state: Store) => ({
      ...state,
      tokensInfos: state.tokensInfos.map((tokenInfos) => {
        if (tokenInfos.id === token) {
          return {
            ...tokenInfos,
            totalSupply: undefined,
            decimals: undefined,
            symbol: undefined
          };
        }
        return tokenInfos;
      })
    }));
  }
});
