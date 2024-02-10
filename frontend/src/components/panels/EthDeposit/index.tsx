import { FC, useCallback, useMemo } from 'react';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import { ethIconUrl, warAddress } from 'config/blockchain';
import { useStore } from '../../../store';
import convertBigintToFormatted from '../../../utils/convertBigintToFormatted';
import convertFormattedToBigInt from '../../../utils/convertFormattedToBigInt';

export interface EthDepositPanelProps {}

export const EthDepositPanel: FC<EthDepositPanelProps> = () => {
  const ethDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('eth'));
  const [setDepositInputTokenAmount, setMaxDepositInputTokenAmount] = useStore((state) => [
    state.setDepositInputTokenAmount,
    state.setMaxDepositInputTokenAmount
  ]);
  const setDepositOutputTokenAmount = useStore((state) => state.setDepositOutputTokenAmount);
  const ethDepositInputAmountFormatted = useMemo(() => {
    return convertBigintToFormatted(ethDepositInputAmount, 18);
  }, [ethDepositInputAmount]);
  const setAmount = useCallback(
    (amount: string) => {
      const amountInWei = convertFormattedToBigInt(amount, 18);
      setDepositInputTokenAmount('eth', amountInWei);
    },
    [setDepositInputTokenAmount]
  );

  return (
    <TokenNumberInput
      ticker={'ETH'}
      iconUrl={ethIconUrl}
      value={ethDepositInputAmountFormatted}
      onInputChange={setAmount}
      onInputClear={() => setDepositOutputTokenAmount('tWAR', 0n)}
      onMaxClick={() => {
        setMaxDepositInputTokenAmount('eth');
      }}
    />
  );
};

EthDepositPanel.defaultProps = {};
