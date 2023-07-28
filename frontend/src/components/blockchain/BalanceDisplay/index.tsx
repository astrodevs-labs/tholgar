import React, { FC } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { CaptionedNumber } from 'components/ui/CaptionedNumber';
import useOrFetchTokenBalance from "hooks/useOrFetchTokenBalance";
import convertBigintToFormatted from "utils/convertBigintToFormatted";
import useOrFetchTokenInfos from "hooks/useOrFetchTokenInfos";

export interface BalanceDisplayProps {
  token: `0x${string}`;
  account?: `0x${string}`;
  description: string;
  displaySymbol?: boolean;
  inline?: boolean;
}

export const BalanceDisplay: FC<BalanceDisplayProps> = ({
  account,
  token,
  description,
  displaySymbol,
  inline,
}) => {
  const { address, isConnected } = useAccount();
  const balance = useOrFetchTokenBalance({address: token});
  const decimals = useOrFetchTokenInfos({address: token});
  const { data } = useBalance({ address: account ?? address ?? '0x0', token: token });
  const balanceFormatted = isConnected
    ? balance !== undefined && decimals !== undefined
      ? convertBigintToFormatted(balance, decimals)
      : '...'
    : '?';
  const symbol = displaySymbol ? data?.symbol || '' : '';

  return <CaptionedNumber caption={description} number={balanceFormatted} symbol={symbol} inline={inline} />;
};

BalanceDisplay.defaultProps = {
  displaySymbol: false,
  inline: false
};
