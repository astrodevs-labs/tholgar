/* eslint-disable no-unused-vars */

import { FC, JSX, useCallback, useMemo } from 'react';
import {
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
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
// import { useBalance, useToken } from 'wagmi';
import convertFormattedToBigInt from 'utils/convertFormattedToBigInt';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import { tokensSelection, useStore } from '../../../store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';

export interface WithdrawPanelProps {}

const tokensOutputs = new Map<string, () => JSX.Element>([
  ['war', () => <WarWithdrawPanel key={1} />],
  ['aura/cvx', () => <AuraCvxWithdrawPanel key={2} />]
]);

const tokens = [{ id: 'war', name: 'WAR', iconUrl: warIconUrl }];

export const WithdrawPanel: FC<WithdrawPanelProps> = () => {
  const wstkWARInfos = useOrFetchTokenInfos({ token: 'wstkWAR' });
  const wstkWARDecimals = wstkWARInfos?.decimals;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const wstkWARWithdrawInputAmount = useStore((state) =>
    state.getWithdrawInputTokenAmount('wstkWAR')
  );
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
      setWithdrawInputTokenAmount('wstkWAR', amountInWei);
    },
    [setWithdrawInputTokenAmount, wstkWARDecimals]
  );
  const isWithdrawDisabled = useMemo(() => {
    return wstkWARWithdrawInputAmount === 0n;
  }, [wstkWARWithdrawInputAmount]);
  const output = tokensOutputs.get(withdrawToken);

  /*const [withdrawAmount, setWithdrawAmount] = useState<string>('0');
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<string>('0');
  const [amounts, setAmounts] = useState<{ token: string; amount: string }[]>([
    { token: 'war', amount: '0' }
  ]);
  const [withdrawToken, setWithdrawToken] = useState<string>('war');
  const output = tokensOutputs.get(withdrawToken);*/

  /*

  const { data: warBalance } = useBalance({
    address: vaultAddress,
    token: stakerAddress
  });

  const { data: vault } = useToken({
    address: vaultAddress
  });

  useEffect(() => {
    if (!warBalance || !vault) return;
    if (
      vault.totalSupply.value === 0n ||
      convertFormattedToBigInt(withdrawAmount, vault.decimals) === 0n
    )
      return;
    const amount =
      (warBalance.value / vault.totalSupply.value) *
      convertFormattedToBigInt(withdrawAmount, vault.decimals);

    setMaxWithdrawAmount(convertBigintToFormatted(amount, warBalance.decimals));
  }, [warBalance, vault]);
*/
  return (
    <>
      <Flex direction={'column'}>
        <TokenNumberInput
          token={vaultAddress}
          ticker={'wstkWAR'}
          value={wstkWARWithdrawInputAmountFormatted}
          iconUrl={wstkWarIconUrl}
          onInputChange={setWithdrawAmount}
          onInputClear={() => {
            setWithdrawOutputTokenAmount('war', 0n);
            setWithdrawOutputTokenAmount('aura', 0n);
            setWithdrawOutputTokenAmount('cvx', 0n);
          }}
          onMaxClick={() => setMaxWithdrawInputTokenAmount('wstkWAR')}
        />
      </Flex>
      <Center my={4}>
        <FontAwesomeIcon icon={faArrowDown} size={'2x'} opacity={useColorModeValue(0.4, 1)} />
      </Center>
      {output && output()}
      <Grid templateColumns="repeat(2, 1fr)" mt={4} gap={6}>
        <GridItem>
          <TokenSelector
            onTokenSelect={(token) => setWithdrawToken(token as tokensSelection)}
            tokens={tokens}
          />
        </GridItem>
        <GridItem>
          <Button
            w={'full'}
            backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
            _hover={{ bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100') }}
            color={useColorModeValue('#00cf6f', 'inherit')}
            onClick={onOpen}
            isDisabled={isWithdrawDisabled}
          >
            Withdraw
          </Button>
        </GridItem>
      </Grid>
      <WithdrawPanelModal open={isOpen} onClose={onClose} />
    </>
  );
};

WithdrawPanel.defaultProps = {};
