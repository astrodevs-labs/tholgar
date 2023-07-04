import {FC, PropsWithChildren} from "react";
import {
  Box,
  useDisclosure
} from '@chakra-ui/react'

import {Header} from 'components/layout/Header'
import {SideBar} from 'components/layout/SideBar'

export interface NavigablePageProps {}

export const NavigablePage: FC<PropsWithChildren<NavigablePageProps>> = ({children}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box as="section" minH="100vh">
      <SideBar onClose={onClose} isOpen={isOpen} />
      <Box ml={{ base: 0, md: "285" }} transition=".3s ease">
        <Header onOpen={onOpen}/>

        <Box as="main" p={4} minH="25rem">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

NavigablePage.defaultProps = {}