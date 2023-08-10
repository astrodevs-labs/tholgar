import { FC, PropsWithChildren } from 'react';
import { Flex, Icon, useColorModeValue } from '@chakra-ui/react';

export interface NavItemProps {
  icon?: any;
}

export const NavItem: FC<PropsWithChildren<NavItemProps>> = (props: any) => {
  const color = useColorModeValue('black', 'gray.200');

  const { icon, children } = props;
  return (
    <Flex
      align="center"
      px="4"
      py="3"
      cursor="pointer"
      role="group"
      fontWeight="semibold"
      transition=".15s ease"
      color={useColorModeValue('gray.600', 'gray.400')}
      _hover={{
        color,
        transition: 'color 0.25s ease'
      }}
    >
      {icon && (
        <Icon
          mx="2"
          boxSize="4"
          _groupHover={{
            color,
            transition: 'color 0.25s ease'
          }}
          color={useColorModeValue('gray.600', 'gray.400')}
          as={icon}
        />
      )}
      {children}
    </Flex>
  );
};

NavItem.defaultProps = {};
