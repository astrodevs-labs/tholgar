import { FC } from 'react';
import { IconButton, Flex, useColorModeValue } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { ColorModeToggle } from 'components/ui/ColorModeToggle';
import { WalletConnectButton } from 'components/blockchain/WalletConnectButton';

export interface HeaderProps {
  onOpen: () => void;
}

export const Header: FC<HeaderProps> = ({ onOpen }) => (
  <Flex
    as="header"
    align="center"
    justify={{ base: 'space-between', md: 'flex-end' }}
    w="full"
    px={'2em'}
    py={'1.25em'}
    borderBottomWidth="1px"
    borderColor={useColorModeValue('border.light', 'border.dark')}
    boxShadow="sm">
    <IconButton
      aria-label="Menu"
      display={{ base: 'inline-flex', md: 'none' }}
      onClick={onOpen}
      icon={<HamburgerIcon />}
      size="md"
    />

    <Flex align="center" gap={2}>
      <ColorModeToggle />
      <WalletConnectButton />
    </Flex>
  </Flex>
);

Header.defaultProps = {};
