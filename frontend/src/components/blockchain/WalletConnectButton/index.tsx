import React, { FC } from 'react';
import { useAccount, useConnect, useEnsName, useDisconnect } from 'wagmi';
import { InjectedConnector } from '@wagmi/core';
import { Button } from '@chakra-ui/react';

export interface WalletConnectButtonProps {}

export const WalletConnectButton: FC<WalletConnectButtonProps> = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect } = useConnect({
    connector: new InjectedConnector()
  });
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <Button bg={'brand.primary'} onClick={() => disconnect()}>
        {ensName ?? address}
      </Button>
    );
  return (
    <Button bg={'brand.primary'} onClick={() => connect()}>
      Connect Wallet
    </Button>
  );
};

WalletConnectButton.defaultProps = {};
