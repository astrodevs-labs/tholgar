import { FC, PropsWithChildren } from 'react';
import { Drawer, DrawerOverlay, DrawerContent, Flex } from '@chakra-ui/react';
import { SideBarBody } from '../SideBarBody';

export interface SideBarProps {
  onClose: () => void;
  isOpen: boolean;
}

export const SideBar: FC<PropsWithChildren<SideBarProps>> = ({ isOpen, onClose }) => {
  return (
    <Flex minHeight={'100vh'}>
      <SideBarBody display={{ base: 'none', md: 'unset' }} />
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent>
          <SideBarBody w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

SideBar.defaultProps = {};
