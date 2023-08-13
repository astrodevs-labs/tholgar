import { StateCreator } from 'zustand';
import { Store } from './index';
import {
  auraAddress,
  cvxAddress,
  stakerAddress,
  vaultAddress,
  warAddress
} from 'config/blockchain';
import { Token } from 'types/Token';

interface TokenBalance {
  id: Token;
  address: `0x${string}`;
  balance?: bigint;
}
export interface TokensBalancesStore {
  tokensBalances: TokenBalance[];
  getTokenBalance: (tokenId: Token) => bigint | undefined;
  getAddressBalance: (address: string) => bigint | undefined;
  setBalances: (balances: TokenBalance[]) => void;
  setTokenBalance: (token: Token, balance?: bigint) => void;
  setAddressBalance: (address: string, balance?: bigint) => void;
  resetBalances: () => void;
}

const defaultTokenBalances: TokenBalance[] = [
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
  },
  {
    id: 'stkWAR',
    address: stakerAddress
  }
];

export const createTokensBalancesStore: StateCreator<Store, [], [], TokensBalancesStore> = (
  set,
  get
) => ({
  tokensBalances: defaultTokenBalances,
  getTokenBalance: (tokenId: Token) =>
    get().tokensBalances.find((tokenBalance) => tokenBalance.id === tokenId)?.balance,
  getAddressBalance: (address: string) =>
    get().tokensBalances.find((tokenBalance) => tokenBalance.address === address)?.balance,
  setBalances: (balances: TokenBalance[]) => set((state: Store) => ({ ...state, balances })),
  setTokenBalance: (token: Token, balance?: bigint) =>
    set((state: Store) => ({
      ...state,
      tokensBalances: state.tokensBalances.map((tokenBalance: TokenBalance) => {
        if (tokenBalance.id === token) {
          return {
            ...tokenBalance,
            balance
          };
        }
        return tokenBalance;
      })
    })),
  setAddressBalance: (address: string, balance?: bigint) =>
    set((state: Store) => ({
      ...state,
      tokensBalances: state.tokensBalances.map((tokenBalance: TokenBalance) => {
        if (tokenBalance.address === address) {
          return {
            ...tokenBalance,
            balance
          };
        }
        return tokenBalance;
      })
    })),
  resetBalances: () => set((state: Store) => ({ ...state, tokensBalances: defaultTokenBalances }))
});
