import {FC} from "react";
import {IconButton, Flex, useColorModeValue, Button} from '@chakra-ui/react'
import {HamburgerIcon} from '@chakra-ui/icons'
import {ColorModeToggle} from "components/ui/ColorModeToggle";

export interface HeaderProps {
  onOpen: () => void
}

export const Header: FC<HeaderProps> =  ({ onOpen }) => (
  <Flex
    as="header"
    align="center"
    justify={{ base: 'space-between', md: 'flex-end' }}
    w="full"
    px="4"
    borderBottomWidth="1px"
    borderColor={useColorModeValue('border.light', 'border.dark')}
    boxShadow="sm"
    h="14"
  >
    <IconButton
      aria-label="Menu"
      display={{ base: 'inline-flex', md: 'none' }}
      onClick={onOpen}
      icon={<HamburgerIcon />}
      size="md"
    />

    <Flex align="center" gap={2}>
      <ColorModeToggle/>
      <Button>REPLACE ME</Button>
    </Flex>
  </Flex>
)

Header.defaultProps = {}