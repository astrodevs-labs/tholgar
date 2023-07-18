import { FC, useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { TokenNumberOutput } from '../../ui/TokenNumberOutput';
import { warIconUrl } from 'config/blockchain';

export interface WarWithdrawPanelProps {
  amounts: { token: string; amount: string }[];
  // eslint-disable-next-line no-unused-vars
  setAmount: (amounts: { token: string; amount: string }[]) => void;
}

export const WarWithdrawPanel: FC<WarWithdrawPanelProps> = ({ amounts, setAmount }) => {
  const amount = amounts.find((am) => am.token == 'war')?.amount || '0';

  useEffect(() => {
    if (!amounts.find((am) => am.token == 'war')) {
      setAmount([{ token: 'war', amount: '0' }]);
    }
  }, [amounts, setAmount]);

  return (
    <Flex direction={'column'}>
      <TokenNumberOutput
        ticker={'WAR'}
        iconUrl={warIconUrl}
        value={amount}
      />
    </Flex>
  );
};

WarWithdrawPanel.defaultProps = {};
