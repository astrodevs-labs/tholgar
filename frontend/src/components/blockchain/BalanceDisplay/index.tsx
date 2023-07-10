import React, { FC } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { CaptionedNumber } from '../../ui/CaptionedNumber';

export interface BalanceDisplayProps {
  token: `0x${string}`;
  account?: `0x${string}`;
  description: string;
  displaySymbol?: boolean;
}

export const BalanceDisplay: FC<BalanceDisplayProps> = ({
  account,
  token,
  description,
  displaySymbol
}) => {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useBalance({ address: account ?? address ?? '0x0', token: token });
  const balance = isConnected ? (isLoading ? '...' : data?.formatted!) : '?';
  const symbol = displaySymbol ? data?.symbol || '' : '';
  return <CaptionedNumber caption={description} number={balance} symbol={symbol} />;
};

BalanceDisplay.defaultProps = {
  displaySymbol: false
};
