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
  ethIconUrl,
  stakerAddress,
  vaultAddress,
  warIconUrl,
  wethAddress,
  wethIconUrl,
  wstkWarIconUrl
} from 'config/blockchain';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import { WalletConnectButton } from 'components/blockchain/WalletConnectButton';
import useConnectedAccount from '../../../hooks/useConnectedAccount';
import { tokensSelection, useStore } from '../../../store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import useTokenRatio from '../../../hooks/useTokenRatio';
import useOrFetchUserTokenBalance from 'hooks/useOrFetchUserTokenBalance';
import { useBalance } from 'wagmi';
import { EthDepositPanel } from '../EthDeposit';
import useParaswapConversionRate from '../../../hooks/useParaswapConversionRate';
import { WethDepositPanel } from '../WethDeposit';

export interface DepositPanelProps {}

const tokensInputs = new Map<string, () => JSX.Element>([
  ['war', () => <WarDepositPanel key={1} />],
  ['aura/cvx', () => <AuraCvxDepositPanel key={2} />],
  ['eth', () => <EthDepositPanel key={3} />],
  ['weth', () => <WethDepositPanel key={4} />]
]);

const tokensDetails = [
  { id: 'war', name: 'WAR', iconUrl: warIconUrl },
  {
    id: 'aura/cvx',
    name: 'AURA/CVX',
    iconUrl: auraCvxIconUrl
  },
  {
    id: 'eth',
    name: 'ETH',
    iconUrl: ethIconUrl
  },
  {
    id: 'weth',
    name: 'WETH',
    iconUrl: wethIconUrl
  }
];

export const DepositPanel: FC<DepositPanelProps> = () => {
  const { isConnected } = useConnectedAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const warDepositAmount = useStore((state) => state.getDepositInputTokenAmount('war'));
  const auraDepositAmount = useStore((state) => state.getDepositInputTokenAmount('aura'));
  const cvxDepositAmount = useStore((state) => state.getDepositInputTokenAmount('cvx'));
  const ethDepositAmount = useStore((state) => state.getDepositInputTokenAmount('eth'));
  const wethDepositAmount = useStore((state) => state.getDepositInputTokenAmount('weth'));
  const wstkWAROutputAmount = useStore((state) => state.getDepositOutputTokenAmount('tWAR'));
  const [depositToken, setDepositToken] = useStore((state) => [
    state.depositToken,
    state.setDepositToken
  ]);
  const setDepositOutputTokenAmounts = useStore((state) => state.setDepositOutputTokenAmount);
  const stakerBalance = useBalance({
    token: stakerAddress,
    address: vaultAddress
  }).data?.value;
  const warBalance = useOrFetchUserTokenBalance({ token: 'war' });
  const auraBalance = useOrFetchUserTokenBalance({ token: 'aura' });
  const cvxBalance = useOrFetchUserTokenBalance({ token: 'cvx' });
  const ethBalance = useOrFetchUserTokenBalance({ token: 'eth' });
  const wethBalance = useOrFetchUserTokenBalance({ token: 'weth' });
  const wstkWarInfos = useOrFetchTokenInfos({ token: 'tWAR' });
  const auraInfos = useOrFetchTokenInfos({ token: 'aura' });
  const cvxInfos = useOrFetchTokenInfos({ token: 'cvx' });
  const wstkWarDecimals = wstkWarInfos?.decimals;
  const wstkWAROutputAmountFormatted = useMemo(
    () =>
      wstkWAROutputAmount && wstkWarDecimals
        ? convertBigintToFormatted(wstkWAROutputAmount, wstkWarDecimals)
        : '0',
    [wstkWAROutputAmount, wstkWarDecimals]
  );
  const auraFromEth = useParaswapConversionRate({
    amount: ethDepositAmount,
    srcToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    destToken: auraAddress,
    srcDecimals: 18,
    destDecimals: auraInfos?.decimals
  });
  const cvxFromEth = useParaswapConversionRate({
    amount: ethDepositAmount,
    srcToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    destToken: cvxAddress,
    srcDecimals: 18,
    destDecimals: cvxInfos?.decimals
  });

  const auraFromWeth = useParaswapConversionRate({
    amount: wethDepositAmount,
    srcToken: wethAddress,
    destToken: auraAddress,
    srcDecimals: 18,
    destDecimals: auraInfos?.decimals
  });
  const cvxFromWeth = useParaswapConversionRate({
    amount: wethDepositAmount,
    srcToken: wethAddress,
    destToken: cvxAddress,
    srcDecimals: 18,
    destDecimals: cvxInfos?.decimals
  });

  const isDepositDisabled = useMemo(() => {
    if (depositToken === 'war')
      return warDepositAmount === 0n || (warBalance !== undefined && warDepositAmount > warBalance);
    else if (depositToken === 'aura/cvx')
      return (
        (auraDepositAmount === 0n && cvxDepositAmount === 0n) ||
        (auraBalance !== undefined && auraDepositAmount > auraBalance) ||
        (cvxBalance !== undefined && cvxDepositAmount > cvxBalance)
      );
    else if (depositToken === 'eth') {
      return ethDepositAmount === 0n || (ethBalance !== undefined && ethDepositAmount > ethBalance);
    } else if (depositToken === 'weth') {
      return (
        wethDepositAmount === 0n || (wethBalance !== undefined && wethDepositAmount > wethBalance)
      );
    }
    return true;
  }, [
    depositToken,
    warDepositAmount,
    auraDepositAmount,
    cvxDepositAmount,
    ethDepositAmount,
    wethDepositAmount,
    ethBalance,
    warBalance,
    auraBalance,
    cvxBalance,
    wethBalance
  ]);
  const input = tokensInputs.get(depositToken);

  const info = useMemo(() => {
    switch (depositToken) {
      case 'war':
        return 'Mint tWAR with WAR';
      case 'aura/cvx':
        return 'Mint tWAR with CVX, AURA or both';
    }
  }, [depositToken]);
  const infoDesc = useMemo(() => {
    switch (depositToken) {
      case 'war':
        return 'Deposit WAR in the vault to mint tWAR. The value of tWAR will grow with time as rewards are harvested.';
      case 'aura/cvx':
        return 'Mint WAR and deposit into the vault in one transaction. The value of tWAR will grow with time as rewards are harvested.';
    }
  }, [depositToken]);

  const auraRatio = useTokenRatio(auraAddress);
  const cvxRatio = useTokenRatio(cvxAddress);

  useEffect(() => {
    // console.log('refreshing tWAR amount');
    // console.log('stakerBalance', stakerBalance);
    // console.log('wstkWarInfos', wstkWarInfos);
    if (
      depositToken !== 'war' ||
      wstkWarInfos?.totalSupply === undefined ||
      stakerBalance === undefined
    )
      return;

    // console.log('stakerBalance', stakerBalance);
    // console.log('wstkWarInfos?.totalSupply', wstkWarInfos?.totalSupply);

    const amount =
      wstkWarInfos?.totalSupply == 0n
        ? warDepositAmount
        : (warDepositAmount * wstkWarInfos?.totalSupply) / stakerBalance;

    setDepositOutputTokenAmounts('tWAR', amount);
  }, [warDepositAmount, depositToken, wstkWarInfos, stakerBalance]);

  useEffect(() => {
    if (
      !auraRatio ||
      !cvxRatio ||
      depositToken !== 'aura/cvx' ||
      wstkWarInfos?.totalSupply === undefined ||
      stakerBalance === undefined
    )
      return;

    const auraAmountInWar = (auraDepositAmount * (auraRatio as bigint)) / BigInt(1e18);
    const cvxAmountInWar = (cvxDepositAmount * (cvxRatio as bigint)) / BigInt(1e18);

    setDepositOutputTokenAmounts(
      'tWAR',
      wstkWarInfos.totalSupply === 0n
        ? auraAmountInWar + cvxAmountInWar
        : ((auraAmountInWar + cvxAmountInWar) * wstkWarInfos?.totalSupply) / stakerBalance
    );
  }, [
    auraRatio,
    cvxRatio,
    auraDepositAmount,
    cvxDepositAmount,
    depositToken,
    wstkWarInfos,
    stakerBalance
  ]);

  useEffect(() => {
    if (
      auraFromEth === undefined ||
      cvxFromEth === undefined ||
      !auraRatio ||
      !cvxRatio ||
      wstkWarInfos?.totalSupply === undefined ||
      stakerBalance === undefined ||
      depositToken !== 'eth'
    )
      return;

    const auraAmountInWar = (auraFromEth * (auraRatio as bigint)) / BigInt(1e18);
    const cvxAmountInWar = (cvxFromEth * (cvxRatio as bigint)) / BigInt(1e18);

    if (auraAmountInWar > cvxAmountInWar) {
      console.log('auraAmountInWar is greater', auraAmountInWar);
    } else {
      console.log('cvxAmountInWar is greater', cvxAmountInWar);
    }
    const bigger = auraAmountInWar > cvxAmountInWar ? auraAmountInWar : cvxAmountInWar;
    const tWarAmount =
      wstkWarInfos.totalSupply === 0n
        ? bigger
        : (bigger * wstkWarInfos?.totalSupply) / stakerBalance;
    setDepositOutputTokenAmounts('tWAR', tWarAmount);
  }, [auraFromEth, cvxFromEth, ethDepositAmount, auraRatio, cvxRatio]);

  useEffect(() => {
    if (
      auraFromWeth === undefined ||
      cvxFromWeth === undefined ||
      !auraRatio ||
      !cvxRatio ||
      wstkWarInfos?.totalSupply === undefined ||
      stakerBalance === undefined ||
      depositToken !== 'weth'
    )
      return;

    const auraAmountInWar = (auraFromWeth * (auraRatio as bigint)) / BigInt(1e18);
    const cvxAmountInWar = (cvxFromWeth * (cvxRatio as bigint)) / BigInt(1e18);

    const bigger = auraAmountInWar > cvxAmountInWar ? auraAmountInWar : cvxAmountInWar;
    const tWarAmount =
      wstkWarInfos.totalSupply === 0n
        ? bigger
        : (bigger * wstkWarInfos?.totalSupply) / stakerBalance;
    setDepositOutputTokenAmounts('tWAR', tWarAmount);
  }, [auraFromWeth, cvxFromWeth, wethDepositAmount, auraRatio, cvxRatio]);

  const buttonBgColor = useColorModeValue('brand.primary.200', 'brand.primary.300');
  const buttonHoverColor = useColorModeValue('brand.primary.300', 'brand.primary.100');
  const buttonColor = useColorModeValue('#00cf6f', 'inherit');

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
                ticker={'tWAR'}
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
                  backgroundColor={buttonBgColor}
                  onClick={onOpen}
                  isDisabled={isDepositDisabled}
                  _hover={{ bgColor: buttonHoverColor }}
                  color={buttonColor}>
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
