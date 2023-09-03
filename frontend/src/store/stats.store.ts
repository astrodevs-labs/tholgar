import { StateCreator } from 'zustand';
import { Store } from './index';

export interface StatsStore {
  circulatingSupply?: string;
  warLocked?: string;
  tvl?: string;
  apy?: string;
  setCirculatingSupply: (supply: string) => void;
  setWarLocked: (amount: string) => void;
  setTvl: (tvl: string) => void;
  setApy: (apy: string) => void;
  resetCirculatingSupply: () => void;
  resetWarLocked: () => void;
  resetTvl: () => void;
  resetApy: () => void;
  resetStats: () => void;
}

export const createStatsStore: StateCreator<Store, [], [], StatsStore> = (set, get) => ({
  circulatingSupply: undefined,
  warLocked: undefined,
  tvl: undefined,
  apy: undefined,

  setCirculatingSupply: (supply: string) =>
    set((state: StatsStore) => ({ ...state, circulatingSupply: supply })),
  setWarLocked: (amount: string) => set((state: StatsStore) => ({ ...state, warLocked: amount })),
  setTvl: (tvl: string) => set((state: StatsStore) => ({ ...state, tvl })),
  setApy: (apy: string) => set((state: StatsStore) => ({ ...state, apy })),
  resetCirculatingSupply: () =>
    set((state: StatsStore) => ({ ...state, circulatingSupply: undefined })),
  resetWarLocked: () => set((state: StatsStore) => ({ ...state, warLocked: undefined })),
  resetTvl: () => set((state: StatsStore) => ({ ...state, tvl: undefined })),
  resetApy: () => set((state: StatsStore) => ({ ...state, apy: undefined })),
  resetStats: () => {
    get().resetCirculatingSupply();
    get().resetWarLocked();
    get().resetTvl();
    get().resetApy();
  }
});
