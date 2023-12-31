import { FC, useCallback, useMemo } from 'react';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import { warAddress, warIconUrl } from 'config/blockchain';
import { useStore } from '../../../store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import convertBigintToFormatted from '../../../utils/convertBigintToFormatted';
import convertFormattedToBigInt from '../../../utils/convertFormattedToBigInt';

export interface WarDepositPanelProps {}

export const WarDepositPanel: FC<WarDepositPanelProps> = () => {
  const warInfos = useOrFetchTokenInfos({ token: 'war' });
  const warDecimals = warInfos?.decimals;
  const warDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('war'));
  const [setDepositInputTokenAmount, setMaxDepositInputTokenAmount] = useStore((state) => [
    state.setDepositInputTokenAmount,
    state.setMaxDepositInputTokenAmount
  ]);
  const setDepositOutputTokenAmount = useStore((state) => state.setDepositOutputTokenAmount);
  const warDepositInputAmountFormatted = useMemo(() => {
    if (!warDecimals) return '0';
    return convertBigintToFormatted(warDepositInputAmount, warDecimals);
  }, [warDepositInputAmount, warDecimals]);
  const setAmount = useCallback(
    (amount: string) => {
      if (!warDecimals) return;
      const amountInWei = convertFormattedToBigInt(amount, warDecimals);
      setDepositInputTokenAmount('war', amountInWei);
    },
    [warDecimals, setDepositInputTokenAmount]
  );

  return (
    <TokenNumberInput
      token={warAddress}
      ticker={'WAR'}
      iconUrl={warIconUrl}
      value={warDepositInputAmountFormatted}
      onInputChange={setAmount}
      onInputClear={() => setDepositOutputTokenAmount('tWAR', 0n)}
      onMaxClick={() => {
        setMaxDepositInputTokenAmount('war');
      }}
    />
  );
};

WarDepositPanel.defaultProps = {};
