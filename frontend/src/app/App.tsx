import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { ChakraProvider } from '@chakra-ui/react'
import {Home} from "pages/home";

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
  }
])

export default function App() {
  return (
    <WagmiConfig config={config}>
      <ChakraProvider>
        <RouterProvider router={router}/>
      </ChakraProvider>
    </WagmiConfig>
  )
}