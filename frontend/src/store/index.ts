import { create } from 'zustand';
import { AccountStore, createAccountStore } from './account.store';
import { createSelectedTokenStore, SelectedTokenStore } from './selectedToken.store';
import { createInputTokensAmountsStore, InputTokensAmountsStore } from './inputTokensAmounts.store';
import { createTokensBalancesStore, TokensBalancesStore } from './tokensBalances.store';
import {
  createOutputTokensAmountsStore,
  OutputTokensAmountsStore
} from './outputTokensAmounts.store';
import { createTokensInformationStore, TokensInformationStore } from './tokensInformation.store';

export type Store = AccountStore &
  SelectedTokenStore &
  InputTokensAmountsStore &
  TokensBalancesStore &
  OutputTokensAmountsStore &
  TokensInformationStore;

export const useStore = create<Store>((...a) => ({
  ...createAccountStore(...a),
  ...createSelectedTokenStore(...a),
  ...createInputTokensAmountsStore(...a),
  ...createTokensBalancesStore(...a),
  ...createOutputTokensAmountsStore(...a),
  ...createTokensInformationStore(...a)
}));

export {
  type AccountStore,
  type SelectedTokenStore,
  type InputTokensAmountsStore,
  type TokensBalancesStore,
  type OutputTokensAmountsStore,
  type TokensInformationStore
};
export type { tokensSelection } from './selectedToken.store';
export type { inputTokenIds } from './inputTokensAmounts.store';
