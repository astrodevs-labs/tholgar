/* eslint-disable no-unused-vars */

import { FC, JSX, useEffect, useState } from 'react';
import { Button, Center, Flex, Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { WarDepositPanel } from '../WarDeposit';
import { AuraCvxDepositPanel } from '../AuraCvxDeposit';
import { DepositPanelModal } from '../DepositModal';
import { TokenSelector } from '../../ui/TokenSelector';
import { vaultABI, warRatioABI, warRedeemerABI } from 'config/abi';
import {
  auraAddress,
  cvxAddress,
  ratioAddress,
  redeemerAddress,
  vaultAddress,
  warIconUrl
} from 'config/blockchain';
import { useContractRead, useToken, useAccount } from 'wagmi';
import convertFormattedToBigInt from 'utils/convertFormattedToBigInt';
import convertBigintToFormatted from 'utils/convertBigintToFormatted';
import { WalletConnectButton } from 'components/blockchain/WalletConnectButton';

export interface DepositPanelProps {}

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
  { id: 'war', name: 'WAR', iconUrl: warIconUrl },
  {
    id: 'aura/cvx',
    name: 'AURA/CVX',
    iconUrl: 'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'
  }
];

export const DepositPanel: FC<DepositPanelProps> = () => {
  const { isConnected } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [amounts, setAmounts] = useState<{ token: string; amount: string }[]>([
    { token: 'war', amount: '0' }
  ]);
  const [depositToken, setDepositToken] = useState<string>('war');
  const input = tokensInputs.get(depositToken);
  const [inputAmount, setInputAmount] = useState<bigint>(0n);
  const [outputAmount, setOutputAmount] = useState<string>('0');

  const { data: war } = useToken({
    address: vaultAddress
  });
  const { data: aura } = useToken({
    address: auraAddress
  });
  const { data: cvx } = useToken({
    address: cvxAddress
  });

  const { data: auraRatio } = useContractRead({
    address: ratioAddress,
    abi: warRatioABI,
    functionName: 'getTokenRatio',
    args: [auraAddress]
  });
  const { data: cvxRatio } = useContractRead({
    address: ratioAddress,
    abi: warRatioABI,
    functionName: 'getTokenRatio',
    args: [cvxAddress]
  });
  const {
    data: depositAmount,
  } = useContractRead({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'previewDeposit',
    args: [inputAmount],
    enabled: true
  });

  useEffect(() => {
    if (!depositAmount || !war) return;
    setOutputAmount(convertBigintToFormatted(depositAmount as bigint, war.decimals))
  }, [depositAmount, war]);

  useEffect(() => {
    if (depositToken === 'war') {
      if (!war) return;
      const formattedAmount = amounts.find((amount) => amount.token === 'war')?.amount;
      if (!formattedAmount) return;

      setInputAmount(convertFormattedToBigInt(formattedAmount, war.decimals));
    } else {
      if (!auraRatio || !cvxRatio || !cvx || !aura) return;
      const auraAmount = amounts.find((amount) => amount.token === 'cvx')?.amount;
      if (!auraAmount) return;
      const auraAmountBigInt = convertFormattedToBigInt(auraAmount, aura.decimals);
      const cvxAmount = amounts.find((amount) => amount.token === 'aura')?.amount;
      if (!cvxAmount) return;
      const cvxAmountBigInt = convertFormattedToBigInt(cvxAmount, cvx.decimals);

      const auraAmountInWar = (auraAmountBigInt * (auraRatio as bigint)) / BigInt(1e18);
      const cvxAmountInWar = (cvxAmountBigInt * (cvxRatio as bigint)) / BigInt(1e18);

      setInputAmount(auraAmountInWar + cvxAmountInWar);
    }
  }, [amounts, depositToken, auraRatio, cvxRatio]);

  return (
    <>
      {input && input(amounts, (amounts) => setAmounts(amounts))}
      <Center my={4}>
        <FontAwesomeIcon icon={faArrowDown} size={'2x'} />
      </Center>
      <Flex direction={'column'}>
        <TokenNumberOutput
          ticker={'wstkWAR'}
          iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
          value={outputAmount}
        />
      </Flex>
      <Grid templateColumns="repeat(2, 1fr)" mt={4} gap={6}>
        <GridItem>
          <TokenSelector onTokenSelect={setDepositToken} tokens={tokens} />
        </GridItem>
        <GridItem>
          {
            isConnected ? 
              <Button w={'full'} backgroundColor={'brand.primary'} onClick={onOpen}>
                Deposit
              </Button>
            :
              <WalletConnectButton/>
          }
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
