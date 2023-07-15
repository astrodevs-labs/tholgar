import { FC, JSX, useState } from 'react';
import { Button, Center, Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WarDepositPanel } from '../WarDeposit';
import { AuraCvxDepositPanel } from '../AuraCvxDeposit';
import { DepositPanelModal } from '../DepositModal';
import { TokenSelector } from '../../ui/TokenSelector';

export interface DepositPanelProps {}

// eslint-disable-next-line no-unused-vars
const tokensInputs = new Map<
  string,
  (
    amount: { token: string; amount: string }[],
    setAmount: (amounts: { token: string; amount: string }[]) => void
  ) => JSX.Element
>([
  [
    'war',
    (amount, setAmount) => <WarDepositPanel key={1} amounts={amount} setAmount={setAmount} />
  ],
  [
    'aura/cvx',
    (amount, setAmount) => <AuraCvxDepositPanel key={2} amounts={amount} setAmount={setAmount} />
  ]
]);

const tokens = [
  { id: 'war', name: 'WAR', iconUrl: 'https://www.convexfinance.com/static/icons/svg/vlcvx.svg' },
  {
    id: 'aura/cvx',
    name: 'Aura/CVX',
    iconUrl: 'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'
  }
];

export const DepositPanel: FC<DepositPanelProps> = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [amounts, setAmounts] = useState<{ token: string; amount: string }[]>([
    { token: 'war', amount: '0.0' }
  ]);
  const [depositToken, setDepositToken] = useState<string>('war');
  const input = tokensInputs.get(depositToken);

  console.log(amounts);

  return (
    <>
      {input && input(amounts, (amounts) => setAmounts(amounts))}
      <Center my={4}>
        <FontAwesomeIcon icon={faArrowDown} size={'2x'} />
      </Center>
      <TokenNumberOutput
        ticker={'wstkWAR'}
        iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
        value={'0.0'}
      />
      <Grid templateColumns="repeat(2, 1fr)" mt={4} gap={6}>
        <GridItem>
          <TokenSelector onTokenSelect={setDepositToken} tokens={tokens} />
        </GridItem>
        <GridItem>
          <Button w={'full'} backgroundColor={'brand.primary'} onClick={onOpen}>
            Deposit
          </Button>
        </GridItem>
      </Grid>
      <DepositPanelModal
        amounts={amounts}
        depositTokens={['war']}
        open={isOpen}
        onClose={onClose}
      />
    </>
  );
};

DepositPanel.defaultProps = {};
