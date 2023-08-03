import { FC, PropsWithChildren } from 'react';
import { Flex, Icon, useColorModeValue } from '@chakra-ui/react';

export interface NavItemProps {
  icon?: any;
}

export const NavItem: FC<PropsWithChildren<NavItemProps>> = (props: any) => {
  const color = useColorModeValue('gray.900', 'gray.200');

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
      color={useColorModeValue('inherit', 'gray.400')}
      _hover={{
        color
      }}
    >
      {icon && (
        <Icon
          mx="2"
          boxSize="4"
          _groupHover={{
            color
          }}
          color={useColorModeValue('inherit', 'gray.400')}
          as={icon}
        />
      )}
      {children}
    </Flex>
  );
};

NavItem.defaultProps = {};
