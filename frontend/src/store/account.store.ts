import { StateCreator } from 'zustand';
import { Store } from './index';

export interface AccountStore {
  address?: `0x${string}`;
  isConnecting: boolean;
  isConnected: boolean;
  setAddress: (address?: `0x${string}`) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
}

export const createAccountStore: StateCreator<Store, [], [], AccountStore> = (set) => ({
  address: undefined,
  isConnecting: false,
  isConnected: false,
  setAddress: (address?: `0x${string}`) => set((state: AccountStore) => ({ ...state, address })),
  setIsConnecting: (isConnecting: boolean) =>
    set((state: AccountStore) => ({ ...state, isConnecting })),
  setIsConnected: (isConnected: boolean) =>
    set((state: AccountStore) => ({ ...state, isConnected }))
});
