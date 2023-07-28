import React, { FC } from 'react';
import { CaptionedNumber } from 'components/ui/CaptionedNumber';
import useOrFetchTokenBalance from 'hooks/useOrFetchTokenBalance';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import useOrFetchTokenInfos from 'hooks/useOrFetchTokenInfos';

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
  inline
}) => {
  const balance = useOrFetchTokenBalance({ address: token, account });
  const infos = useOrFetchTokenInfos({ address: token });
  const decimals = infos?.decimals;
  const balanceFormatted =
    balance !== undefined && decimals !== undefined
      ? convertBigintToFormatted(balance, decimals)
      : '...';
  const symbol = displaySymbol ? infos?.symbol || '' : '';

  return (
    <CaptionedNumber
      caption={description}
      number={balanceFormatted}
      symbol={symbol}
      inline={inline}
    />
  );
};

BalanceDisplay.defaultProps = {
  displaySymbol: false,
  inline: false
};
