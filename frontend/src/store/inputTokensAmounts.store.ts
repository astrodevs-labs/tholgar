import { StateCreator } from 'zustand';
import { Store } from './index';

export type inputTokenIds = 'war' | 'aura' | 'cvx' | 'wstkWAR';

export interface TokenAmount {
  id: inputTokenIds;
  amount: bigint;
}
export interface InputTokensAmountsStore {
  depositInputTokensAmounts: TokenAmount[];
  withdrawInputTokensAmounts: TokenAmount[];
  getDepositInputTokenAmount: (tokenId: inputTokenIds) => bigint;
  getWithdrawInputTokenAmount: (tokenId: inputTokenIds) => bigint;
  setDepositInputTokensAmounts: (token: TokenAmount[]) => void;
  setDepositInputTokenAmount: (tokenId: inputTokenIds, amount: bigint) => void;
  setMaxDepositInputTokenAmount: (tokenId: inputTokenIds) => void;
  setWithdrawInputTokensAmounts: (token: TokenAmount[]) => void;
  setWithdrawInputTokenAmount: (tokenId: inputTokenIds, amount: bigint) => void;
  setMaxWithdrawInputTokenAmount: (tokenId: inputTokenIds) => void;
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
    id: 'wstkWAR',
    amount: BigInt(0)
  }
];

export const createInputTokensAmountsStore: StateCreator<Store, [], [], InputTokensAmountsStore> = (
  set,
  get
) => ({
  depositInputTokensAmounts: defaultTokenAmounts,
  withdrawInputTokensAmounts: defaultTokenAmounts,
  getDepositInputTokenAmount: (tokenId: inputTokenIds) =>
    get().depositInputTokensAmounts.find((tokenAmount) => tokenAmount.id === tokenId)?.amount ||
    BigInt(0),
  getWithdrawInputTokenAmount: (tokenId: inputTokenIds) =>
    get().withdrawInputTokensAmounts.find((tokenAmount) => tokenAmount.id === tokenId)?.amount ||
    BigInt(0),
  setDepositInputTokensAmounts: (token: TokenAmount[]) =>
    set((state: Store) => ({ ...state, depositInputTokensAmounts: token })),
  setDepositInputTokenAmount: (tokenId: inputTokenIds, amount: bigint) =>
    set((state: Store) => ({
      ...state,
      depositInputTokensAmounts: state.depositInputTokensAmounts.map((tokenAmount: TokenAmount) => {
        if (tokenAmount.id === tokenId) {
          return {
            ...tokenAmount,
            amount
          };
        }
        return tokenAmount;
      })
    })),
  setMaxDepositInputTokenAmount: (tokenId: inputTokenIds) =>
    set((state: Store) => ({
      ...state,
      depositInputTokensAmounts: state.depositInputTokensAmounts.map((tokenAmount: TokenAmount) => {
        if (tokenAmount.id === tokenId) {
          return {
            ...tokenAmount,
            amount:
              state.tokensBalances.find((tokenBalance) => tokenBalance.id === tokenId)?.balance ||
              BigInt(0)
          };
        }
        return tokenAmount;
      })
    })),
  setWithdrawInputTokensAmounts: (token: TokenAmount[]) =>
    set((state: Store) => ({ ...state, withdrawInputTokensAmounts: token })),
  setWithdrawInputTokenAmount: (tokenId: inputTokenIds, amount: bigint) =>
    set((state: Store) => ({
      ...state,
      withdrawInputTokensAmounts: state.withdrawInputTokensAmounts.map(
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
  setMaxWithdrawInputTokenAmount: (tokenId: inputTokenIds) =>
    set((state: Store) => ({
      ...state,
      withdrawInputTokensAmounts: state.withdrawInputTokensAmounts.map(
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
