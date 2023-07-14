import { FC } from 'react';
import { Container } from 'components/ui/Container';
import { BalanceDisplay } from '../../components/blockchain/BalanceDisplay';
import {addresses} from "../../config/blockchain";
import {DepositPanel} from "../../components/panels/Deposit";
import { StatsDisplay } from 'components/blockchain/StatsDisplay';

const AutoCompounder: FC = () => {
  return (
    <>
      <StatsDisplay />
      <Container p={4}>
        <BalanceDisplay
          token={addresses.usdc}
          description={'USDC Balance'}
        />

      </Container>
      <Container p={4} my={4}>
        <DepositPanel />
      </Container>
    </>
  );
};

export default AutoCompounder;
