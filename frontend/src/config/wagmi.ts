import { createConfig, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { alchemyProvider } from 'wagmi/providers/alchemy';

if (!process.env.REACT_APP_ALCHEMY_KEY || !process.env.REACT_APP_RAIMBOW_APP_NAME || !process.env.REACT_APP_RAIMBOW_PROJECT_ID) {
  throw new Error('Cannot create wagmi config');
}

const {chains, publicClient } = configureChains(
  [mainnet],
  [publicProvider(), alchemyProvider({
    apiKey: process.env.REACT_APP_ALCHEMY_KEY,
  })]
);

const { connectors } = getDefaultWallets({
  appName: process.env.REACT_APP_RAIMBOW_APP_NAME,
  projectId: process.env.REACT_APP_RAIMBOW_PROJECT_ID,
  chains
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { chains };