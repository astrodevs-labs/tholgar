import React, { FC } from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export interface WalletConnectButtonProps {}

export const WalletConnectButton: FC<WalletConnectButtonProps> = () => {
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
          >
            {(() => {
              if (!connected) {
                return (
                  <Button bg={'brand.primary'} onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return <Button onClick={openChainModal}>Wrong network</Button>;
              }

              return (
                <Flex gap={12}>
                  <Button bg={'brand.primary'} onClick={openAccountModal}>
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
