import { StateCreator } from 'zustand';
import { Store } from './index';

export type tokensSelection = 'war' | 'aura/cvx';
export interface SelectedTokenStore {
  depositToken: tokensSelection;
  withdrawToken: tokensSelection;
  setDepositToken: (token: tokensSelection) => void;
  setWithdrawToken: (token: tokensSelection) => void;
}

export const createSelectedTokenStore: StateCreator<Store, [], [], SelectedTokenStore> = (set) => ({
  depositToken: 'war',
  withdrawToken: 'war',
  setDepositToken: (token: tokensSelection) =>
    set((state: Store) => ({ ...state, depositToken: token })),
  setWithdrawToken: (token: tokensSelection) =>
    set((state: Store) => ({ ...state, withdrawToken: token }))
});
