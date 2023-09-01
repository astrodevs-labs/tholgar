import React, {FC, useMemo} from 'react';
import { CaptionedNumber } from 'components/ui/CaptionedNumber';
import useOrFetchTokenBalance from 'hooks/useOrFetchTokenBalance';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import useOrFetchTokenInfos from 'hooks/useOrFetchTokenInfos';
import useConnectedAccount from 'hooks/useConnectedAccount';
import { Spinner } from '@chakra-ui/spinner';

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
  const { isConnected } = useConnectedAccount();
  const balance = useOrFetchTokenBalance({ address: token, account });
  const infos = useOrFetchTokenInfos({ address: token });
  const decimals = infos?.decimals;
  const balanceFormatted = useMemo(() => {
    console.log('balanceFormatted', balance, decimals);
    if (balance !== undefined && decimals !== undefined) {
      return convertBigintToFormatted(balance, decimals);
    } else if (isConnected) {
      return <Spinner />;
    } else {
      return '?';
    }
  }, [balance, decimals, isConnected]);
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
