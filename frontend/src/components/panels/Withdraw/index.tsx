/* eslint-disable no-unused-vars */

import { FC, JSX, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WarWithdrawPanel } from '../WarWithdraw';
import { AuraCvxWithdrawPanel } from '../AuraCvxWithdraw';
import { WithdrawPanelModal } from '../WithdrawModal';
import { TokenSelector } from '../../ui/TokenSelector';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import { vaultAddress, warIconUrl, wstkWarIconUrl } from '../../../config/blockchain';
import convertFormattedToBigInt from 'utils/convertFormattedToBigInt';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import { tokensSelection, useStore } from '../../../store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import { WalletConnectButton } from 'components/blockchain/WalletConnectButton';
import useConnectedAccount from 'hooks/useConnectedAccount';

export interface WithdrawPanelProps {}

const tokensOutputs = new Map<string, () => JSX.Element>([
  ['war', () => <WarWithdrawPanel key={1} />],
  ['aura/cvx', () => <AuraCvxWithdrawPanel key={2} />]
]);

const tokens = [{ id: 'war', name: 'WAR', iconUrl: warIconUrl }];

export const WithdrawPanel: FC<WithdrawPanelProps> = () => {
  const wstkWARInfos = useOrFetchTokenInfos({ token: 'tWAR' });
  const wstkWARDecimals = wstkWARInfos?.decimals;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected } = useConnectedAccount();
  const wstkWARWithdrawInputAmount = useStore((state) => state.getWithdrawInputTokenAmount('tWAR'));
  const setWithdrawInputTokenAmount = useStore((state) => state.setWithdrawInputTokenAmount);
  const setMaxWithdrawInputTokenAmount = useStore((state) => state.setMaxWithdrawInputTokenAmount);
  const [withdrawToken, setWithdrawToken] = useStore((state) => [
    state.withdrawToken,
    state.setWithdrawToken
  ]);
  const setWithdrawOutputTokenAmount = useStore((state) => state.setWithdrawOutputTokenAmount);
  const wstkWARWithdrawInputAmountFormatted = useMemo(() => {
    if (!wstkWARDecimals) return '0';
    return convertBigintToFormatted(wstkWARWithdrawInputAmount, wstkWARDecimals);
  }, [wstkWARWithdrawInputAmount, wstkWARDecimals]);
  const setWithdrawAmount = useCallback(
    (amount: string) => {
      if (!wstkWARDecimals) return;
      const amountInWei = convertFormattedToBigInt(amount, wstkWARDecimals);
      setWithdrawInputTokenAmount('tWAR', amountInWei);
    },
    [setWithdrawInputTokenAmount, wstkWARDecimals]
  );
  const isWithdrawDisabled = useMemo(() => {
    return wstkWARWithdrawInputAmount === 0n;
  }, [wstkWARWithdrawInputAmount]);
  const output = tokensOutputs.get(withdrawToken);

  const info = useMemo(() => {
    switch (withdrawToken) {
      case 'war':
        return 'Redeem tWAR for WAR';
    }
  }, [withdrawToken]);
  const infoDesc = useMemo(() => {
    switch (withdrawToken) {
      case 'war':
        return 'Redeem your tWAR for WAR. You can then redeem the WAR for CVX or AURA on Warlord frontend.';
    }
  }, [withdrawToken]);

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
              <Text fontWeight={'semibold'}>Amount to withdraw</Text>
            </Box>
            <Box w="100%">
              <TokenNumberInput
                token={vaultAddress}
                ticker={'tWAR'}
                value={wstkWARWithdrawInputAmountFormatted}
                iconUrl={wstkWarIconUrl}
                onInputChange={setWithdrawAmount}
                onInputClear={() => {
                  setWithdrawOutputTokenAmount('war', 0n);
                  setWithdrawOutputTokenAmount('aura', 0n);
                  setWithdrawOutputTokenAmount('cvx', 0n);
                }}
                onMaxClick={() => setMaxWithdrawInputTokenAmount('tWAR')}
              />
            </Box>
            <Box w="100%">
              <Center>
                <FontAwesomeIcon
                  icon={faArrowDown}
                  size={'2x'}
                  opacity={useColorModeValue(0.4, 1)}
                />
              </Center>
            </Box>
            <Box w="100%">{output && output()}</Box>
          </VStack>
        </Box>
        <Box w="100%">
          <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={5}>
            <GridItem>
              <TokenSelector
                onTokenSelect={(token) => setWithdrawToken(token as tokensSelection)}
                tokens={tokens}
              />
            </GridItem>
            <GridItem>
              {isConnected ? (
                <Button
                  w={'full'}
                  backgroundColor={buttonBgColor}
                  _hover={{ bgColor: buttonHoverColor }}
                  color={buttonColor}
                  onClick={onOpen}
                  isDisabled={isWithdrawDisabled}>
                  Withdraw
                </Button>
              ) : (
                <WalletConnectButton />
              )}
            </GridItem>
          </Grid>
        </Box>
      </VStack>
      <WithdrawPanelModal open={isOpen} onClose={onClose} />
    </>
  );
};

WithdrawPanel.defaultProps = {};
