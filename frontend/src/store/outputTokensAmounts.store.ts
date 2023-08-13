import { StateCreator } from 'zustand';
import { Store } from './index';

type tokenIds = 'war' | 'aura' | 'cvx' | 'tWAR';

export interface TokenAmount {
  id: tokenIds;
  amount: bigint;
}
export interface OutputTokensAmountsStore {
  depositOutputTokensAmounts: TokenAmount[];
  withdrawOutputTokensAmounts: TokenAmount[];
  getDepositOutputTokenAmount: (tokenId: tokenIds) => bigint;
  getWithdrawOutputTokenAmount: (tokenId: tokenIds) => bigint;
  setDepositOutputTokensAmounts: (token: TokenAmount[]) => void;
  setDepositOutputTokenAmount: (tokenId: tokenIds, amount: bigint) => void;
  setMaxDepositOutputTokenAmount: (tokenId: tokenIds) => void;
  setWithdrawOutputTokensAmounts: (token: TokenAmount[]) => void;
  setWithdrawOutputTokenAmount: (tokenId: tokenIds, amount: bigint) => void;
  setMaxWithdrawOutputTokenAmount: (tokenId: tokenIds) => void;
}

const defaultTokenAmounts: TokenAmount[] = [
  {
    id: 'war',
    amount: BigInt(0)
  },
  {
    id: 'aura',
    amount: BigInt(0)
  },
  {
    id: 'cvx',
    amount: BigInt(0)
  },
  {
    id: 'tWAR',
    amount: BigInt(0)
  }
];

export const createOutputTokensAmountsStore: StateCreator<
  Store,
  [],
  [],
  OutputTokensAmountsStore
> = (set, get) => ({
  depositOutputTokensAmounts: defaultTokenAmounts,
  withdrawOutputTokensAmounts: defaultTokenAmounts,
  getDepositOutputTokenAmount: (tokenId: tokenIds) =>
    get().depositOutputTokensAmounts.find((tokenAmount) => tokenAmount.id === tokenId)?.amount ||
    BigInt(0),
  getWithdrawOutputTokenAmount: (tokenId: tokenIds) =>
    get().withdrawOutputTokensAmounts.find((tokenAmount) => tokenAmount.id === tokenId)?.amount ||
    BigInt(0),
  setDepositOutputTokensAmounts: (token: TokenAmount[]) =>
    set((state: Store) => ({ ...state, depositOutputTokensAmounts: token })),
  setDepositOutputTokenAmount: (tokenId: tokenIds, amount: bigint) =>
    set((state: Store) => ({
      ...state,
      depositOutputTokensAmounts: state.depositOutputTokensAmounts.map(
        (tokenAmount: TokenAmount) => {
          if (tokenAmount.id === tokenId) {
            return {
              ...tokenAmount,
              amount
            };
          }
          return tokenAmount;
        }
      )
    })),
  setMaxDepositOutputTokenAmount: (tokenId: tokenIds) =>
    set((state: Store) => ({
      ...state,
      depositOutputTokensAmounts: state.depositOutputTokensAmounts.map(
        (tokenAmount: TokenAmount) => {
          if (tokenAmount.id === tokenId) {
            return {
              ...tokenAmount,
              amount:
                state.tokensBalances.find((tokenBalance) => tokenBalance.id === tokenId)?.balance ||
                BigInt(0)
            };
          }
          return tokenAmount;
        }
      )
    })),
  setWithdrawOutputTokensAmounts: (token: TokenAmount[]) =>
    set((state: Store) => ({ ...state, withdrawOutputTokensAmounts: token })),
  setWithdrawOutputTokenAmount: (tokenId: tokenIds, amount: bigint) =>
    set((state: Store) => ({
      ...state,
      withdrawOutputTokensAmounts: state.withdrawOutputTokensAmounts.map(
        (tokenAmount: TokenAmount) => {
          if (tokenAmount.id === tokenId) {
            return {
              ...tokenAmount,
              amount
            };
          }
          return tokenAmount;
        }
      )
    })),
  setMaxWithdrawOutputTokenAmount: (tokenId: tokenIds) =>
    set((state: Store) => ({
      ...state,
      withdrawOutputTokensAmounts: state.withdrawOutputTokensAmounts.map(
        (tokenAmount: TokenAmount) => {
          if (tokenAmount.id === tokenId) {
            return {
              ...tokenAmount,
              amount:
                state.tokensBalances.find((tokenBalance) => tokenBalance.id === tokenId)?.balance ||
                BigInt(0)
            };
          }
          return tokenAmount;
        }
      )
    }))
});
