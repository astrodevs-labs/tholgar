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
      <Tabs colorScheme="green" size="lg" _selected={{}}>
        <Container
          p={0}
          pt={1}
          my={0}
          mx="4em"
          borderBottomRadius={'0'}
          borderBottom={'0'}
          borderRadius={'1.5em'}
        >
          <TabList borderBottom={'none'}>
            <Tab>Deposit</Tab>
            <Tab>Withdraw</Tab>
          </TabList>
        </Container>

        <Container p={4} my={0} mx="4em" borderTopRadius={'0'} borderRadius={'1.5em'}>
          <TabPanels>
            <TabPanel>
              <DepositPanel />
            </TabPanel>
            <TabPanel>
              <WithdrawPanel />
            </TabPanel>
          </TabPanels>
        </Container>
      </Tabs>
    </>
  );
};

export default AutoCompounder;
