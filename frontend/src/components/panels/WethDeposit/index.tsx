import { FC, useCallback, useMemo } from 'react';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import { wethAddress, wethIconUrl } from 'config/blockchain';
import { useStore } from '../../../store';
import convertBigintToFormatted from '../../../utils/convertBigintToFormatted';
import convertFormattedToBigInt from '../../../utils/convertFormattedToBigInt';

export interface WethDepositPanelProps {}

export const WethDepositPanel: FC<WethDepositPanelProps> = () => {
  const ethDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('weth'));
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
      setDepositInputTokenAmount('weth', amountInWei);
    },
    [setDepositInputTokenAmount]
  );

  return (
    <TokenNumberInput
      token={wethAddress}
      ticker={'WETH'}
      iconUrl={wethIconUrl}
      value={ethDepositInputAmountFormatted}
      onInputChange={setAmount}
      onInputClear={() => setDepositOutputTokenAmount('tWAR', 0n)}
      onMaxClick={() => {
        setMaxDepositInputTokenAmount('weth');
      }}
    />
  );
};

WethDepositPanel.defaultProps = {};
