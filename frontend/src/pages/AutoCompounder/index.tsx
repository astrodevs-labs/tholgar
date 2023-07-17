import { FC } from 'react';
import { Container } from 'components/ui/Container';
import { DepositPanel } from '../../components/panels/Deposit';
import { StatsDisplay } from 'components/blockchain/StatsDisplay';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { WithdrawPanel } from '../../components/panels/Withdraw';

const AutoCompounder: FC = () => {
  return (
    <>
      <StatsDisplay />
      <Container p={4} my={4}>
        <Tabs>
          <TabList>
            <Tab>Deposit</Tab>
            <Tab>Withdraw</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <DepositPanel />
            </TabPanel>
            <TabPanel>
              <WithdrawPanel />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};

export default AutoCompounder;
