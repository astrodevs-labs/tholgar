import { createConfig, configureChains } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet } from 'viem/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { QueryClient } from '@tanstack/react-query';

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
        http: 'http://localhost:8545'
      })
    })
  ]
);

const { connectors } = getDefaultWallets({
  appName: process.env.REACT_APP_RAIMBOW_APP_NAME,
  projectId: process.env.REACT_APP_RAIMBOW_PROJECT_ID,
  chains
});

export const config = createConfig({
  autoConnect: true,
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1, // 24 hours
        networkMode: 'offlineFirst',
        refetchOnWindowFocus: false,
        retry: 0,
        staleTime: 1 // 24 hours
      },
      mutations: {
        networkMode: 'offlineFirst'
      }
    }
  }),
  connectors,
  publicClient
});

export { chains };
