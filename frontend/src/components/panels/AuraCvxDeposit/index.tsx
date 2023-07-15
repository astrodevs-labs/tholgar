import { FC, useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { auraAddress, cvxAddress } from '../../../config/blockchain';
import { TokenNumberInput } from '../../inputs/TokenNumberInput';

export interface AuraCvxDepositPanelProps {
  amounts: { token: string; amount: string }[];
  // eslint-disable-next-line no-unused-vars
  setAmount: (amounts: { token: string; amount: string }[]) => void;
}

export const AuraCvxDepositPanel: FC<AuraCvxDepositPanelProps> = ({ amounts, setAmount }) => {
  const [auraBalance, setAuraBalance] = useState<bigint>(0n);
  const [cvxBalance, setCvxBalance] = useState<bigint>(0n);
  const auraAmount = amounts.find((am) => am.token == 'aura')?.amount || '0';
  const cvxAmount = amounts.find((am) => am.token == 'cvx')?.amount || '0';

  useEffect(() => {
    if (!amounts.find((am) => am.token == 'aura')) {
      setAmount([...amounts, { token: 'aura', amount: '0' }]);
    }
    if (!amounts.find((am) => am.token == 'cvx')) {
      setAmount([...amounts, { token: 'cvx', amount: '0' }]);
    }
  }, [amounts, setAmount]);

  return (
    <Flex direction={'column'} gap={4}>
      <TokenNumberInput
        token={auraAddress}
        ticker={'AURA'}
        iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
        value={auraAmount}
        onInputChange={(amount) =>
          setAmount(amounts.map((am) => (am.token == 'aura' ? { token: 'aura', amount } : am)))
        }
        onBalanceRetrieval={setAuraBalance}
        onMaxClick={() =>
          setAmount(
            amounts.map((am) =>
              am.token == 'aura' ? { token: 'aura', amount: auraBalance.toString() } : am
            )
          )
        }
      />
      <TokenNumberInput
        token={cvxAddress}
        ticker={'CVX'}
        iconUrl={'https://www.convexfinance.com/static/icons/svg/vlcvx.svg'}
        value={cvxAmount}
        onInputChange={(amount) =>
          setAmount(amounts.map((am) => (am.token == 'cvx' ? { token: 'cvx', amount } : am)))
        }
        onBalanceRetrieval={setCvxBalance}
        onMaxClick={() =>
          setAmount(
            amounts.map((am) =>
              am.token == 'cvx' ? { token: 'cvx', amount: cvxBalance.toString() } : am
            )
          )
        }
      />
    </Flex>
  );
};

AuraCvxDepositPanel.defaultProps = {};
