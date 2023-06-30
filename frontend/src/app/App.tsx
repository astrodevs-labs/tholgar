import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { ChakraProvider } from '@chakra-ui/react'
import {Home, Test} from "pages";
import theme from "utils/theme";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
  {
    path: "/test",
    element: <Test/>
  }
])

export default function App() {
  return (
    <WagmiConfig config={config}>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router}/>
      </ChakraProvider>
    </WagmiConfig>
  )
}