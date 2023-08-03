import React, { FC } from 'react';
import { Box, BoxProps, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export interface WalletConnectButtonProps extends BoxProps {}

export const WalletConnectButton: FC<WalletConnectButtonProps> = (props) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <Box
            opacity={ready ? 1 : 0}
            pointerEvents={ready ? 'auto' : 'none'}
            userSelect={ready ? 'auto' : 'none'}
            aria-hidden={ready ? undefined : true}
            {...props}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    w={'100%'}
                    backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
                    _hover={{
                      bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100')
                    }}
                    color={useColorModeValue('#00cf6f', 'inherit')}
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
                    _hover={{
                      bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100')
                    }}
                    color={useColorModeValue('#00cf6f', 'inherit')}
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <Flex gap={12}>
                  <Button
                    backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
                    _hover={{
                      bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100')
                    }}
                    color={useColorModeValue('#00cf6f', 'inherit')}
                    onClick={openAccountModal}
                  >
                    {account.displayName}
                  </Button>
                </Flex>
              );
            })()}
          </Box>
        );
      }}
    </ConnectButton.Custom>
  );
};

WalletConnectButton.defaultProps = {};
