import React, { FC, useMemo } from 'react';
import { CaptionedNumber } from 'components/ui/CaptionedNumber';
// import useOrFetchUserTokenBalance from 'hooks/useOrFetchUserTokenBalance';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import useOrFetchTokenInfos from 'hooks/useOrFetchTokenInfos';
import useConnectedAccount from 'hooks/useConnectedAccount';
import { Spinner } from '@chakra-ui/spinner';
import { useBalance } from 'wagmi';

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
  const { isConnected, address } = useConnectedAccount();
  const balance = useBalance({
    token,
    address: account ? account : address
  }).data?.value;
  // const balance = account
  //   ? useBalance({
  //       token,
  //       address: account
  //     }).data?.value
  //   : useOrFetchUserTokenBalance({ address: token });
  const infos = useOrFetchTokenInfos({ address: token });
  const decimals = infos?.decimals;
  const balanceFormatted = useMemo(() => {
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
