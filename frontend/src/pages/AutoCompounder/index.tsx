import { FC } from 'react';
import { Container } from 'components/ui/Container';
import { DepositPanel } from '../../components/panels/Deposit';
import { StatsDisplay } from 'components/blockchain/StatsDisplay';

const AutoCompounder: FC = () => {
  return (
    <>
      <StatsDisplay />
      <Container p={4} my={4}>
        <DepositPanel />
      </Container>
    </>
  );
};

export default AutoCompounder;
