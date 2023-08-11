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
          borderRadius={'1.5em'}>
          <TabList borderBottom={'none'}>
            <Tab>Deposit</Tab>
            <Tab>Withdraw</Tab>
          </TabList>
        </Container>

        <Container px={6} py={9} my={0} mx="4em" borderTopRadius={'0'} borderRadius={'1.5em'}>
          <TabPanels>
            <TabPanel p={0}>
              <DepositPanel />
            </TabPanel>
            <TabPanel p={0}>
              <WithdrawPanel />
            </TabPanel>
          </TabPanels>
        </Container>
      </Tabs>
    </>
  );
};

export default AutoCompounder;
