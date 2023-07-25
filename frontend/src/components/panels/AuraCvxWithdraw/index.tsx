import {FC, useEffect, useMemo} from 'react';
import { Flex } from '@chakra-ui/react';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import {auraAddress, auraIconUrl, cvxAddress, cvxIconUrl} from 'config/blockchain';
import useOrFetchTokenInfos from "../../../hooks/useOrFetchTokenInfos";
import {useStore} from "../../../store";
import convertBigintToFormatted from "../../../utils/convertBigintToFormatted";
import useTokenRatio from "../../../hooks/useTokenRatio";

export interface AuraCvxWithdrawPanelProps {}

export const AuraCvxWithdrawPanel: FC<AuraCvxWithdrawPanelProps> = () => {
  const auraDecimals = useOrFetchTokenInfos({token: 'aura'});
  const cvxDecimals = useOrFetchTokenInfos({token: 'cvx'});
  const wstWARWithdrawInputAmount = useStore(state => state.getWithdrawInputTokenAmount('wstkWAR'));
  const auraWithdrawOutputAmount = useStore(state => state.getWithdrawOutputTokenAmount('aura'));
  const cvxWithdrawOutputAmount = useStore(state => state.getWithdrawOutputTokenAmount('cvx'));
  const setWithdrawOutputAmount = useStore(state => state.setWithdrawOutputTokenAmount);
  const auraWithdrawOutputAmountFormatted = useMemo(() => {
    if (!auraDecimals) return '0';
    return convertBigintToFormatted(auraWithdrawOutputAmount, auraDecimals);
  }, [auraWithdrawOutputAmount, auraDecimals]);
  const cvxWithdrawOutputAmountFormatted = useMemo(() => {
    if (!cvxDecimals) return '0';
    return convertBigintToFormatted(cvxWithdrawOutputAmount, cvxDecimals);
  }, [cvxWithdrawOutputAmount, cvxDecimals]);
  const auraRatio = useTokenRatio(auraAddress);
  const cvxRatio = useTokenRatio(cvxAddress);
  
  /*const auraAmount = amounts.find((am) => am.token == 'aura')?.amount || '0';
  const cvxAmount = amounts.find((am) => am.token == 'cvx')?.amount || '0';*/
  
  useEffect(() => {
    if (!auraRatio) return;
    const auraAmount = (wstWARWithdrawInputAmount * BigInt(1e18)) / auraRatio;
    setWithdrawOutputAmount('aura', auraAmount);
  }, [auraRatio, wstWARWithdrawInputAmount]);

  useEffect(() => {
    if (!cvxRatio) return;
    const cvxAmount = (wstWARWithdrawInputAmount * BigInt(1e18)) / cvxRatio;
    setWithdrawOutputAmount('cvx', cvxAmount);
  }, [cvxRatio, wstWARWithdrawInputAmount]);

  /*useEffect(() => {
    if (!amounts.find((am) => am.token == 'aura')) {
      setAmount([...amounts, { token: 'aura', amount: '0' }]);
    }
    if (!amounts.find((am) => am.token == 'cvx')) {
      setAmount([...amounts, { token: 'cvx', amount: '0' }]);
    }
  }, [amounts, setAmount]);*/

  return (
    <Flex direction={'column'} gap={4}>
      <TokenNumberOutput ticker={'AURA'} iconUrl={auraIconUrl} value={auraWithdrawOutputAmountFormatted} />
      <TokenNumberOutput ticker={'CVX'} iconUrl={cvxIconUrl} value={cvxWithdrawOutputAmountFormatted} />
    </Flex>
  );
};

AuraCvxWithdrawPanel.defaultProps = {};
