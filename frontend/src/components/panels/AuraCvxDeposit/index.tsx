import { FC, useCallback, useMemo } from 'react';
import { Flex } from '@chakra-ui/react';
import { auraAddress, auraIconUrl, cvxAddress, cvxIconUrl } from '../../../config/blockchain';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import { useStore } from '../../../store';
import convertBigintToFormatted from '../../../utils/convertBigintToFormatted';
import convertFormattedToBigInt from '../../../utils/convertFormattedToBigInt';

export interface AuraCvxDepositPanelProps {}

export const AuraCvxDepositPanel: FC<AuraCvxDepositPanelProps> = () => {
  const auraInfos = useOrFetchTokenInfos({ token: 'aura' });
  const auraDecimals = auraInfos?.decimals;
  const cvxInfos = useOrFetchTokenInfos({ token: 'cvx' });
  const cvxDecimals = cvxInfos?.decimals;
  const auraDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('aura'));
  const cvxDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('cvx'));
  const [setDepositInputTokenAmount, setMaxDepositInputTokenAmount] = useStore((state) => [
    state.setDepositInputTokenAmount,
    state.setMaxDepositInputTokenAmount
  ]);
  const auraDepositInputAmountFormatted = useMemo(() => {
    if (!auraDecimals) return '0';
    return convertBigintToFormatted(auraDepositInputAmount, auraDecimals);
  }, [auraDepositInputAmount, auraDecimals]);
  const cvxDepositInputAmountFormatted = useMemo(() => {
    if (!cvxDecimals) return '0';
    return convertBigintToFormatted(cvxDepositInputAmount, cvxDecimals);
  }, [cvxDepositInputAmount, cvxDecimals]);
  const setAuraAmount = useCallback(
    (amount: string) => {
      if (!auraDecimals) return;
      const amountInWei = convertFormattedToBigInt(amount, auraDecimals);
      setDepositInputTokenAmount('aura', amountInWei);
    },
    [auraDecimals, setDepositInputTokenAmount]
  );
  const setCvxAmount = useCallback(
    (amount: string) => {
      if (!cvxDecimals) return;
      const amountInWei = convertFormattedToBigInt(amount, cvxDecimals);
      setDepositInputTokenAmount('cvx', amountInWei);
    },
    [cvxDecimals, setDepositInputTokenAmount]
  );

  return (
    <Flex direction={'column'} gap={2}>
      <TokenNumberInput
        token={auraAddress}
        ticker={'AURA'}
        iconUrl={auraIconUrl}
        value={auraDepositInputAmountFormatted}
        onInputChange={setAuraAmount}
        onMaxClick={() => setMaxDepositInputTokenAmount('aura')}
      />
      <TokenNumberInput
        token={cvxAddress}
        ticker={'CVX'}
        iconUrl={cvxIconUrl}
        value={cvxDepositInputAmountFormatted}
        onInputChange={setCvxAmount}
        onMaxClick={() => setMaxDepositInputTokenAmount('cvx')}
      />
    </Flex>
  );
};

AuraCvxDepositPanel.defaultProps = {};
