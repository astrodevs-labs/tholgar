/* eslint-disable */

import { FC, JSX, useEffect, useMemo } from 'react';
import {
  Button,
  Center,
  Grid,
  GridItem,
  VStack,
  Text,
  useColorModeValue,
  useDisclosure,
  Box
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WarDepositPanel } from '../WarDeposit';
import { AuraCvxDepositPanel } from '../AuraCvxDeposit';
import { DepositPanelModal } from '../DepositModal';
import { TokenSelector } from '../../ui/TokenSelector';
import {
  auraAddress,
  auraCvxIconUrl,
  cvxAddress,
  stakerAddress,
  vaultAddress,
  warIconUrl,
  wstkWarIconUrl
} from 'config/blockchain';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import { WalletConnectButton } from 'components/blockchain/WalletConnectButton';
import useConnectedAccount from '../../../hooks/useConnectedAccount';
import { tokensSelection, useStore } from '../../../store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import useTokenRatio from '../../../hooks/useTokenRatio';
import useOrFetchTokenBalance from 'hooks/useOrFetchTokenBalance';

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
  const stakerBalance = useOrFetchTokenBalance({ address: stakerAddress, account: vaultAddress });
  const wstkWarInfos = useOrFetchTokenInfos({ token: 'wstkWAR' });
  const wstkWarDecimals = wstkWarInfos?.decimals;
  const wstkWAROutputAmountFormatted = useMemo(
    () =>
      wstkWAROutputAmount && wstkWarDecimals
        ? convertBigintToFormatted(wstkWAROutputAmount, wstkWarDecimals)
        : '0',
    [wstkWAROutputAmount]
  );
  const isDepositDisabled = useMemo(() => {
    if (depositToken === 'war') return warDepositAmount === 0n;
    if (depositToken === 'aura/cvx') return auraDepositAmount === 0n && cvxDepositAmount === 0n;
    return true;
  }, [depositToken, warDepositAmount, auraDepositAmount, cvxDepositAmount]);
  const input = tokensInputs.get(depositToken);

  const info = useMemo(() => {
    switch (depositToken) {
      case 'war':
        return 'Mint wstkWAR with WAR';
      case 'aura/cvx':
        return 'Mint wstkWAR with CVX, AURA or both';
    }
  }, [depositToken]);
  const infoDesc = useMemo(() => {
    switch (depositToken) {
      case 'war':
        return 'Deposit WAR in the vault to mint wstkWAR. The value of wstkWAR will grow with time as rewards are harvested.';
      case 'aura/cvx':
        return 'Mint WAR and deposit into the vault in one transaction. The value of wstkWAR will grow with time as rewards are harvested.';
    }
  }, [depositToken]);

  const auraRatio = useTokenRatio(auraAddress);
  const cvxRatio = useTokenRatio(cvxAddress);

  useEffect(() => {
    if (
      depositToken !== 'war' ||
      wstkWarInfos?.totalSupply === undefined ||
      stakerBalance === undefined
    )
      return;

    const amount =
      wstkWarInfos?.totalSupply == 0n
        ? warDepositAmount
        : (warDepositAmount * wstkWarInfos?.totalSupply) / stakerBalance;

    setDepositOutputTokenAmounts('wstkWAR', amount);
  }, [warDepositAmount, depositToken, wstkWarInfos, stakerBalance]);

  useEffect(() => {
    if (!auraRatio || !cvxRatio || depositToken !== 'aura/cvx') return;

    const auraAmountInWar = (auraDepositAmount * (auraRatio as bigint)) / BigInt(1e18);
    const cvxAmountInWar = (cvxDepositAmount * (cvxRatio as bigint)) / BigInt(1e18);

    setDepositOutputTokenAmounts('wstkWAR', auraAmountInWar + cvxAmountInWar);
  }, [auraRatio, cvxRatio, auraDepositAmount, cvxDepositAmount, depositToken]);

  return (
    <>
      <VStack gap={5}>
        <Box w="100%">
          <Text fontSize={'1.125em'} fontWeight={'semibold'}>
            {info}
          </Text>
          <Text opacity={0.7}>{infoDesc}</Text>
        </Box>
        <Box w="100%">
          <VStack gap={2}>
            <Box w="100%">
              <Text fontWeight={'semibold'}>Amount to deposit</Text>
            </Box>

            <Box w="100%">{input && input()}</Box>
            <Center>
              <FontAwesomeIcon icon={faArrowDown} size={'2x'} opacity={useColorModeValue(0.4, 1)} />
            </Center>
            <Box w="100%">
              <TokenNumberOutput
                ticker={'wstkWAR'}
                iconUrl={wstkWarIconUrl}
                value={wstkWAROutputAmountFormatted}
              />
            </Box>
          </VStack>
        </Box>
        <Box w="100%">
          <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={5}>
            <GridItem>
              <TokenSelector
                onTokenSelect={(token) => setDepositToken(token as tokensSelection)}
                tokens={tokensDetails}
              />
            </GridItem>
            <GridItem>
              {isConnected ? (
                <Button
                  w={'full'}
                  backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
                  onClick={onOpen}
                  isDisabled={isDepositDisabled}
                  _hover={{ bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100') }}
                  color={useColorModeValue('#00cf6f', 'inherit')}>
                  Deposit
                </Button>
              ) : (
                <WalletConnectButton />
              )}
            </GridItem>
          </Grid>
        </Box>
      </VStack>
      <DepositPanelModal depositTokens={depositToken} open={isOpen} onClose={onClose} />
    </>
  );
};

DepositPanel.defaultProps = {};
