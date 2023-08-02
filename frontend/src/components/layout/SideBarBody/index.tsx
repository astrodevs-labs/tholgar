import { FC, PropsWithChildren } from 'react';
import {
  Box,
  BoxProps,
  Flex,
  Icon,
  Spacer,
  Text,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { BiQuestionMark, BiHome } from 'react-icons/bi';
import { NavItem } from '../NavItem';
import { Link } from '@chakra-ui/react';

export interface SideBarBodyProps extends BoxProps {}

export const SideBarBody: FC<PropsWithChildren<SideBarBodyProps>> = (props) => {
  const display = useBreakpointValue({ base: 'none', md: 'unset' });
  return (
    <Flex
      as="nav"
      className={'sidebar'}
      top="0"
      left="0"
      direction={'column'}
      zIndex="sticky"
      overflowX="hidden"
      overflowY="auto"
      borderColor={useColorModeValue('border.light', 'border.dark')}
      borderRightWidth="1px"
      {...(display === 'none' ? props : '')}
    >
      <Flex px="4" py="5" align="center">
        <Icon as={DragHandleIcon} h={8} w={8} />
        <Text
          fontSize="2xl"
          ml="2"
          color={useColorModeValue('brand.500', 'white')}
          fontWeight="semibold"
        >
          Thalgar
        </Text>
      </Flex>
      <Flex direction="column" as="nav" fontSize="md" aria-label="Main Navigation">
        <Link href={'/'} _hover={{}}>
          <NavItem icon={BiHome}>Home</NavItem>
        </Link>
        <Link href={'faq'}  _hover={{}}>
          <NavItem icon={BiQuestionMark}>FAQ</NavItem>
        </Link>
      </Flex>
      <Spacer />
      <Box px="4" py="5">
        <Text fontSize="sm" fontWeight="semibold" align={'center'}>
          A product for the <a href={'https://paladin.vote'}>Paladin</a> ecosystem
        </Text>
      </Box>
    </Flex>
  );
};

SideBarBody.defaultProps = {};
