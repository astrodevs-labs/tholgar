import { FC, useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';
import { warAddress } from 'config/blockchain';

export interface WarDepositPanelProps {
  amounts: { token: string; amount: string }[];
  // eslint-disable-next-line no-unused-vars
  setAmount: (amounts: { token: string; amount: string }[]) => void;
}

export const WarDepositPanel: FC<WarDepositPanelProps> = ({ amounts, setAmount }) => {
  const [warBalance, setWarBalance] = useState<bigint>(0n);
  const amount = amounts.find((am) => am.token == 'war')?.amount || '0';

  useEffect(() => {
    if (!amounts.find((am) => am.token == 'war')) {
      setAmount([{ token: 'war', amount: '0' }]);
    }
  }, [amounts, setAmount]);

  return (
    <Flex direction={'column'}>
      <TokenNumberInput
        token={warAddress}
        ticker={'WAR'}
        iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
        value={amount}
        onInputChange={(amount) => setAmount([{ token: 'war', amount }])}
        onBalanceRetrieval={setWarBalance}
        onMaxClick={() => setAmount([{ token: 'war', amount: warBalance.toString() }])}
      />
    </Flex>
  );
};

WarDepositPanel.defaultProps = {};
