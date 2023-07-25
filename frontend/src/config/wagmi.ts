import { createConfig, configureChains } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet } from 'viem/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
// import { alchemyProvider } from 'wagmi/providers/alchemy';
// import {publicProvider} from "wagmi/providers/public";

if (
  !process.env.REACT_APP_ALCHEMY_KEY ||
  !process.env.REACT_APP_RAIMBOW_APP_NAME ||
  !process.env.REACT_APP_RAIMBOW_PROJECT_ID
) {
  throw new Error('Cannot create wagmi config');
}

const { chains, publicClient } = configureChains(
  [mainnet],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: `http://localhost:8545`
      })
    })
    // publicProvider(),
    /*
    alchemyProvider({

      apiKey: process.env.REACT_APP_ALCHEMY_KEY
    })*/
  ]
);

const { connectors } = getDefaultWallets({
  appName: process.env.REACT_APP_RAIMBOW_APP_NAME,
  projectId: process.env.REACT_APP_RAIMBOW_PROJECT_ID,
  chains
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export { chains };
