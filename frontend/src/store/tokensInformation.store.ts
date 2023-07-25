import { StateCreator } from 'zustand';
import { Store } from './index';
import { auraAddress, cvxAddress, vaultAddress, warAddress } from '../config/blockchain';
import { Token } from 'types/Token';

interface TokenInfo {
  id: Token;
  address: `0x${string}`;
  decimals?: number;
}
export interface TokensInformationStore {
  tokensInfos: TokenInfo[];
  getTokenDecimals: (tokenId: Token) => number | undefined;
  getAddressDecimals: (address: string) => number | undefined;
  setTokensInfos: (balances: TokenInfo[]) => void;
  setTokenInfos: (token: Token, decimals: number) => void;
  setAddressInfos: (address: string, decimals: number) => void;
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
    id: 'wstkWAR',
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
  getAddressDecimals: (address: string) =>
    get().tokensInfos.find((tokenInfos) => tokenInfos.address === address)?.decimals,
  setTokensInfos: (infos: TokenInfo[]) => set((state: Store) => ({ ...state, tokensInfos: infos })),
  setTokenInfos: (token: Token, decimals: number) =>
    set((state: Store) => ({
      ...state,
      tokensInfos: state.tokensInfos.map((tokenInfos) => {
        if (tokenInfos.id === token) {
          return {
            ...tokenInfos,
            decimals
          };
        }
        return tokenInfos;
      })
    })),
  setAddressInfos: (address: string, decimals: number) =>
    set((state: Store) => ({
      ...state,
      tokensInfos: state.tokensInfos.map((tokenInfos) => {
        if (tokenInfos.address === address) {
          return {
            ...tokenInfos,
            decimals
          };
        }
        return tokenInfos;
      })
    }))
});
