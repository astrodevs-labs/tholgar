import { FC, PropsWithChildren } from 'react';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';

import { Header } from 'components/layout/Header';
import { SideBar } from 'components/layout/SideBar';

export interface NavigablePageProps {}

export const NavigablePage: FC<PropsWithChildren<NavigablePageProps>> = ({ children }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  /*
  return (
    <Box as="section" minH="100vh">
      <SideBar onClose={onClose} isOpen={isOpen} />
      <Box ml={{ base: 0, md: '263' }} transition=".3s ease">
        <Header onOpen={onOpen} />

        <Box as="main" p={4} minH="25rem">
          {children}
        </Box>
      </Box>
    </Box>
  );
  */
  return (
    <Flex flexDirection="row" className="tarace">
      <SideBar onClose={onClose} isOpen={isOpen} />
      <Flex flexDirection="column" w={'100%'}>
        <Header onOpen={onOpen} />
        <Box as="main" p={4} minH="25rem">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

NavigablePage.defaultProps = {};
