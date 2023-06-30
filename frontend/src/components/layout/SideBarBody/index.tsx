import {FC, PropsWithChildren} from "react";
import {
  Button,
  VStack,
} from '@chakra-ui/react'

export interface SideBarBodyProps {
  onClick: () => void
}

export const SideBarBody: FC<PropsWithChildren<SideBarBodyProps>> = ({ onClick }) => (
  <VStack>
    <Button onClick={onClick} w="100%">
      Home
    </Button>
    <Button onClick={onClick} w="100%">
      About
    </Button>
    <Button onClick={onClick} w="100%">
      Contact
    </Button>
  </VStack>
)

SideBarBody.defaultProps = {

}