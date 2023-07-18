/* eslint-disable no-unused-vars */

import { FC, JSX, useEffect, useState } from 'react';
import { Button, Center, Flex, Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WarWithdrawPanel } from '../WarWithdraw';
import { AuraCvxWithdrawPanel } from '../AuraCvxWithdraw';
import { WithdrawPanelModal } from '../WithdrawModal';
import { TokenSelector } from '../../ui/TokenSelector';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import { stakerAddress, vaultAddress, warIconUrl } from '../../../config/blockchain';
import { useBalance, useToken } from 'wagmi';
import convertFormattedToBigInt from 'utils/convertFormattedToBigInt';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';

export interface WithdrawPanelProps {}

const tokensOutputs = new Map<
  string,
  (
    amount: { token: string; amount: string }[],
    setAmount: (amounts: { token: string; amount: string }[]) => void
  ) => JSX.Element
>([
  [
    'war',
    (amount, setAmount) => <WarWithdrawPanel key={1} amounts={amount} setAmount={setAmount} />
  ],
  [
    'aura/cvx',
    (amount, setAmount) => <AuraCvxWithdrawPanel key={2} amounts={amount} setAmount={setAmount} />
  ]
]);

const tokens = [
  { id: 'war', name: 'WAR', iconUrl: warIconUrl },
];

export const WithdrawPanel: FC<WithdrawPanelProps> = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0');
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<string>('0');
  const [amounts, setAmounts] = useState<{ token: string; amount: string }[]>([
    { token: 'war', amount: '0' }
  ]);
  const [withdrawToken, setWithdrawToken] = useState<string>('war');
  const output = tokensOutputs.get(withdrawToken);

  const {
    data: warBalance,
  } = useBalance({
    address: vaultAddress,
    token: stakerAddress,
  });

  const { data: vault } = useToken({
    address: vaultAddress
  });

  useEffect(() => {
    if (!warBalance || !vault) return;
    const amount = warBalance.value / vault.totalSupply.value * convertFormattedToBigInt(withdrawAmount, vault.decimals);

    setMaxWithdrawAmount(convertBigintToFormatted(amount, warBalance.decimals));
  }, [warBalance, vault])

  return (
    <>
      <Flex direction={'column'}>
        <TokenNumberInput
          token={vaultAddress}
          ticker={'wstkWAR'}
          value={withdrawAmount}
          iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
          onInputChange={setWithdrawAmount}
          onBalanceRetrieval={(max) => setMaxWithdrawAmount(max)}
          onMaxClick={() => setWithdrawAmount(maxWithdrawAmount)}
        />
      </Flex>
      <Center my={4}>
        <FontAwesomeIcon icon={faArrowDown} size={'2x'} />
      </Center>
      {output && output(amounts, setAmounts)}
      <Grid templateColumns="repeat(2, 1fr)" mt={4} gap={6}>
        <GridItem>
          <TokenSelector onTokenSelect={setWithdrawToken} tokens={tokens} />
        </GridItem>
        <GridItem>
          <Button w={'full'} backgroundColor={'brand.primary'} onClick={onOpen}>
            Withdraw
          </Button>
        </GridItem>
      </Grid>
      <WithdrawPanelModal
        amounts={amounts}
        withdrawTokens={['war']}
        open={isOpen}
        onClose={onClose}
      />
    </>
  );
};

WithdrawPanel.defaultProps = {};
