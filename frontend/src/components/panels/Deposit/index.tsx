/* eslint-disable no-unused-vars */

import { FC, JSX, useEffect, useMemo } from 'react';
import { Button, Center, Flex, Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WarDepositPanel } from '../WarDeposit';
import { AuraCvxDepositPanel } from '../AuraCvxDeposit';
import { DepositPanelModal } from '../DepositModal';
import { TokenSelector } from '../../ui/TokenSelector';
import { auraAddress, auraCvxIconUrl, cvxAddress, warIconUrl } from 'config/blockchain';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import { WalletConnectButton } from 'components/blockchain/WalletConnectButton';
import useConnectedAccount from '../../../hooks/useConnectedAccount';
import { tokensSelection, useStore } from '../../../store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import useTokenRatio from '../../../hooks/useTokenRatio';

export interface DepositPanelProps {}

const tokensInputs = new Map<string, () => JSX.Element>([
  ['war', () => <WarDepositPanel key={1} />],
  ['aura/cvx', () => <AuraCvxDepositPanel key={2} />]
]);

const tokensDetails = [
  { id: 'war', name: 'WAR', iconUrl: warIconUrl },
  {
    id: 'aura/cvx',
    name: 'AURA/CVX',
    iconUrl: auraCvxIconUrl
  }
];

export const DepositPanel: FC<DepositPanelProps> = () => {
  const { isConnected } = useConnectedAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const warDepositAmount = useStore((state) => state.getDepositInputTokenAmount('war'));
  const auraDepositAmount = useStore((state) => state.getDepositInputTokenAmount('aura'));
  const cvxDepositAmount = useStore((state) => state.getDepositInputTokenAmount('cvx'));
  const wstkWAROutputAmount = useStore((state) => state.getDepositOutputTokenAmount('wstkWAR'));
  const [depositToken, setDepositToken] = useStore((state) => [
    state.depositToken,
    state.setDepositToken
  ]);
  const setDepositOutputTokenAmounts = useStore((state) => state.setDepositOutputTokenAmount);
  const wstkWarDecimals = useOrFetchTokenInfos({ token: 'wstkWAR' });
  const wstkWAROutputAmountFormatted = useMemo(
    () =>
      wstkWAROutputAmount && wstkWarDecimals
        ? convertBigintToFormatted(wstkWAROutputAmount, wstkWarDecimals)
        : '0',
    [wstkWAROutputAmount]
  );
  const input = tokensInputs.get(depositToken);

  const auraRatio = useTokenRatio(auraAddress);
  const cvxRatio = useTokenRatio(cvxAddress);
  /*  const {
    data: depositAmount,
  } = useContractRead({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'previewDeposit',
    args: [ws],
    enabled: true
  });

  useEffect(() => {
    if (!depositAmount || !war) return;
    setOutputAmount(convertBigintToFormatted(depositAmount as bigint, war.decimals))
  }, [depositAmount, war]);*/

  useEffect(() => {
    if (depositToken !== 'war') return;
    setDepositOutputTokenAmounts('wstkWAR', warDepositAmount);
  }, [warDepositAmount, depositToken === 'war']);

  useEffect(() => {
    if (!auraRatio || !cvxRatio || depositToken !== 'aura/cvx') return;

    const auraAmountInWar = (auraDepositAmount * (auraRatio as bigint)) / BigInt(1e18);
    const cvxAmountInWar = (cvxDepositAmount * (cvxRatio as bigint)) / BigInt(1e18);

    setDepositOutputTokenAmounts('wstkWAR', auraAmountInWar + cvxAmountInWar);
  }, [auraRatio, cvxRatio, auraDepositAmount, cvxDepositAmount, depositToken === 'aura/cvx']);

  /*
  useEffect(() => {
    if (depositToken === 'war') {
      const warAmount = inputAmounts.find((amount) => amount.token === 'war')?.amount;
      if (!warAmount) return;
      setDepositOutputTokenAmounts('wstkWAR', warAmount);
    } else {
      if (!auraRatio || !cvxRatio || !cvxDecimals || !auraDecimals) return;
      const auraAmount = inputAmounts.find((amount) => amount.token === 'cvx')?.amount;
      if (!auraAmount) return;
      const auraAmountBigInt = convertFormattedToBigInt(auraAmount, auraDecimals);
      const cvxAmount = inputAmounts.find((amount) => amount.token === 'aura')?.amount;
      if (!cvxAmount) return;
      const cvxAmountBigInt = convertFormattedToBigInt(cvxAmount, cvxDecimals);

      const auraAmountInWar = (auraAmountBigInt * (auraRatio as bigint)) / BigInt(1e18);
      const cvxAmountInWar = (cvxAmountBigInt * (cvxRatio as bigint)) / BigInt(1e18);

      setInputAmount(auraAmountInWar + cvxAmountInWar);
    }
  }, [inputAmounts, depositToken, auraRatio, cvxRatio]);
 */

  return (
    <>
      {input && input()}
      <Center my={4}>
        <FontAwesomeIcon icon={faArrowDown} size={'2x'} />
      </Center>
      <Flex direction={'column'}>
        <TokenNumberOutput
          ticker={'wstkWAR'}
          iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
          value={wstkWAROutputAmountFormatted}
        />
      </Flex>
      <Grid templateColumns="repeat(2, 1fr)" mt={4} gap={6}>
        <GridItem>
          <TokenSelector
            onTokenSelect={(token) => setDepositToken(token as tokensSelection)}
            tokens={tokensDetails}
          />
        </GridItem>
        <GridItem>
          {isConnected ? (
            <Button w={'full'} backgroundColor={'brand.primary'} onClick={onOpen}>
              Deposit
            </Button>
          ) : (
            <WalletConnectButton />
          )}
        </GridItem>
      </Grid>
      <DepositPanelModal depositTokens={depositToken} open={isOpen} onClose={onClose} />
    </>
  );
};

DepositPanel.defaultProps = {};
