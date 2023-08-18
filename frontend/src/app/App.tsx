import React from 'react';
import {
  /*RouterProvider, Navigate, createBrowserRouter */
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import {ChakraProvider} from '@chakra-ui/react';
import {AutoCompounder, DesktopRedirect, FAQ /*Pounder*/} from 'pages';
import theme from 'config/theme';
import { NavigablePage } from '../components/layout';
import { config, chains } from 'config/wagmi';
import {
  RainbowKitProvider,
  cssStringFromTheme,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';
import useCheckMobileScreen from "../hooks/useCheckMobileScreen";

/*const router = createBrowserRouter([
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
]);*/

const Router = () => (
  <Routes>
    <Route path={'/'} element={<AutoCompounder />} />
    <Route path={'/faq'} element={<FAQ />} />
  </Routes>
);

const ViewportRouter = () => {
  const isMobile = useCheckMobileScreen();
  if (isMobile )
    return (
      <DesktopRedirect/>
    )
  return (
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
        <BrowserRouter>
          <NavigablePage>
            <Router />
          </NavigablePage>
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <ViewportRouter/>
    </ChakraProvider>
  );
}
