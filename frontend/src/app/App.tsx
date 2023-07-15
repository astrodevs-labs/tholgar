import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { ChakraProvider } from '@chakra-ui/react';
import { AutoCompounder, FAQ, Pounder } from 'pages';
import theme from 'config/theme';
import { NavigablePage } from '../components/layout';
import { config, chains } from 'config/wagmi';
import {
  RainbowKitProvider,
  cssStringFromTheme,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AutoCompounder />
  },
  {
    path: '/pounder',
    element: <Pounder />
  },
  {
    path: '/faq',
    element: <FAQ />
  },
  {
    path: '*',
    element: <Navigate to="/" />
  }
]);

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains} theme={null}>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            html[data-theme='light'] {
              ${cssStringFromTheme(lightTheme)}
            }

            html[data-theme='dark'] {
              ${cssStringFromTheme(darkTheme)}
            }
          `
            }}
          />
          <NavigablePage>
            <RouterProvider router={router} />
          </NavigablePage>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}