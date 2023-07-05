import {FC, PropsWithChildren} from "react";
import {
  Box, BoxProps,
  Flex, Icon, Spacer, Text, useBreakpointValue, useColorModeValue,
} from '@chakra-ui/react'
import {DragHandleIcon} from "@chakra-ui/icons";
import {NavItem} from "../NavItem";

export interface SideBarBodyProps extends BoxProps {
}

export const SideBarBody: FC<PropsWithChildren<SideBarBodyProps>> = (props) => {
  const display = useBreakpointValue({ base: 'none', md: 'unset' });
  return (
    <Flex
      as="nav"
      pos="fixed"
      className={"sidebar"}
      top="0"
      left="0"
      direction={"column"}
      zIndex="sticky"
      h="100vh"
      overflowX="hidden"
      overflowY="auto"
      borderColor={useColorModeValue('inherit', 'gray.700')}
      borderRightWidth="1px"
      w="100"
      {...(display === "none" ? props : "")}
    >
      <Flex px="4" py="5" align="center">
        <Icon as={DragHandleIcon} h={8} w={8}/>
        <Text
          fontSize="2xl"
          ml="2"
          color={useColorModeValue('brand.500', 'white')}
          fontWeight="semibold"
        >
          Auto-Compounder
        </Text>
      </Flex>
      <Flex direction="column" as="nav" fontSize="md" color="gray.600" aria-label="Main Navigation">
        <NavItem icon={DragHandleIcon}><a href={"/"}>Auto-compounder</a></NavItem>
        <NavItem icon={DragHandleIcon}><a href={"pounder"}>Pounder</a></NavItem>
        <NavItem icon={DragHandleIcon}><a href={"faq"}>FAQ</a></NavItem>
      </Flex>
      <Spacer/>
      <Box px="4" py="5">
        <Text
          fontSize="sm"
          fontWeight="semibold"
        >
          A product for the <a href={"https://paladin.vote"}>Paladin</a> ecosystem
        </Text>
      </Box>
    </Flex>
  )
}

SideBarBody.defaultProps = {

}