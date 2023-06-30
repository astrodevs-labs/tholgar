import {FC, PropsWithChildren} from "react";
import { Box, Center, IconButton, Text, Flex } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'

export interface HeaderProps {
  onShowSidebar: () => void
  showSidebarButton?: boolean
}

export const Header: FC<HeaderProps> =  ({ showSidebarButton, onShowSidebar }) => {
  return (
    <Flex bg="tomato" p={4} color="white" justifyContent="center">
      <Box flex="1">
        {showSidebarButton && (
          <IconButton
            icon={<ChevronRightIcon w={8} h={8} />}
            colorScheme="blackAlpha"
            variant="outline"
            onClick={onShowSidebar}
            aria-label={"Show sidebar"}
          />
        )}
      </Box>
      <Center flex="1" h="40px">
        <Text fontSize="xl">Page Title</Text>
      </Center>
      <Box flex="1" />
    </Flex>
  )
}

Header.defaultProps = {
  showSidebarButton: true
}