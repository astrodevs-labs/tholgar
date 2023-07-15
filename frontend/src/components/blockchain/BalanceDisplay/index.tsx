import React, { FC, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { CaptionedNumber } from '../../ui/CaptionedNumber';

export interface BalanceDisplayProps {
  token: `0x${string}`;
  account?: `0x${string}`;
  description: string;
  displaySymbol?: boolean;
  inline?: boolean;
  // eslint-disable-next-line no-unused-vars
  onBalanceRetrieval?: (balance: bigint) => void;
}

export const BalanceDisplay: FC<BalanceDisplayProps> = ({
  account,
  token,
  description,
  displaySymbol,
  inline,
  onBalanceRetrieval
}) => {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useBalance({ address: account ?? address ?? '0x0', token: token });
  const balance = isConnected ? (isLoading ? '...' : data?.formatted!) : '?';
  const symbol = displaySymbol ? data?.symbol || '' : '';

  useEffect(() => {
    if (data?.value && onBalanceRetrieval) {
      onBalanceRetrieval(data.value);
    }
  }, [data?.value, onBalanceRetrieval]);

  return <CaptionedNumber caption={description} number={balance} symbol={symbol} inline={inline} />;
};

BalanceDisplay.defaultProps = {
  displaySymbol: false,
  inline: false
};
