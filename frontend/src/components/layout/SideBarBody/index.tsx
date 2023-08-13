import { FC, PropsWithChildren } from 'react';
import {
  Box,
  BoxProps,
  Divider,
  Flex,
  HStack,
  VStack,
  Icon,
  Image,
  Spacer,
  Text,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react';
import { BiQuestionMark, BiHome, BiLogoDiscord, BiLogoTwitter, BiLogoGithub } from 'react-icons/bi';
import { NavItem } from '../NavItem';
import { Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

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
      {...(display === 'none' ? props : '')}>
      <Flex px="4" py="5" align="center">
        <Image
          src={useColorModeValue('/images/logoFull.png', '/images/logoFullWhite.png')}
          h={'40px'}
        />
      </Flex>
      <Divider color={useColorModeValue('border.light', 'border.dark')} opacity={'unset'} />
      <Flex direction="column" as="nav" fontSize="md" aria-label="Main Navigation">
        <Link {...{} /*_hover={{}} onClick={gotoHome}*/} to={'/'}>
          <NavItem icon={BiHome}>Home</NavItem>
        </Link>
        <Link {...{} /*_hover={{}} onClick={gotoFaq}*/} to={'/faq'}>
          <NavItem icon={BiQuestionMark}>FAQ</NavItem>
        </Link>
      </Flex>
      <Spacer />
      <Divider color={useColorModeValue('border.light', 'black')} opacity={'unset'} />
      <VStack mx="4" my={'5'}>
        <HStack justify="center" gap="1.5em">
          <ChakraLink href={'https://discord.gg/xr4zcRxsuK'} isExternal>
            <Icon
              as={BiLogoDiscord}
              _hover={{
                color: useColorModeValue('black', 'gray.400'),
                transition: 'color 0.25s ease'
              }}
              color={useColorModeValue('gray.600', 'white')}
              boxSize={8}
            />
          </ChakraLink>
          <ChakraLink href={'https://twitter.com/TholgarFi'} isExternal>
            <Icon
              as={BiLogoTwitter}
              _hover={{
                color: useColorModeValue('black', 'gray.400'),
                transition: 'color 0.25s ease'
              }}
              color={useColorModeValue('gray.600', 'white')}
              boxSize={8}
            />
          </ChakraLink>
          <ChakraLink href={'https://github.com/0xtekgrinder/warlord-autocompounder'} isExternal>
            <Icon
              as={BiLogoGithub}
              _hover={{
                color: useColorModeValue('black', 'gray.400'),
                transition: 'color 0.25s ease'
              }}
              color={useColorModeValue('gray.600', 'white')}
              boxSize={8}
            />
          </ChakraLink>
        </HStack>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" align={'center'}>
            A product for the <a href={'https://paladin.vote'}>Paladin</a> ecosystem
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
};

SideBarBody.defaultProps = {};
