import {FC, useEffect, useMemo} from 'react';
import { Flex } from '@chakra-ui/react';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import { warIconUrl } from 'config/blockchain';
import {useStore} from "../../../store";
import useOrFetchTokenInfos from "../../../hooks/useOrFetchTokenInfos";
import convertBigintToFormatted from "../../../utils/convertBigintToFormatted";

export interface WarWithdrawPanelProps {}

export const WarWithdrawPanel: FC<WarWithdrawPanelProps> = () => {
  const warDecimals = useOrFetchTokenInfos({token: 'war'})
  const wstkWARWithdrawInputAmount = useStore(state => state.getWithdrawInputTokenAmount('wstkWAR'))
  const warWithdrawOutputAmount = useStore(state => state.getWithdrawOutputTokenAmount('war'))
  const setWithdrawOutputAmount = useStore(state => state.setWithdrawOutputTokenAmount);
  const warWithdrawOutputAmountFormatted = useMemo(() => {
    if (!warDecimals) return '0';
    return convertBigintToFormatted(warWithdrawOutputAmount, warDecimals)
  }, [warWithdrawOutputAmount, warDecimals])

  useEffect(() => {
    setWithdrawOutputAmount('war', wstkWARWithdrawInputAmount)
  }, [wstkWARWithdrawInputAmount, setWithdrawOutputAmount]);

  return (
    <Flex direction={'column'}>
      <TokenNumberOutput ticker={'WAR'} iconUrl={warIconUrl} value={warWithdrawOutputAmountFormatted} />
    </Flex>
  );
};

WarWithdrawPanel.defaultProps = {};
