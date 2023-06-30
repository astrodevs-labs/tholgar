import {Container} from "components/ui/Container/Container";
import {ColorModeToggle} from "components/ui/ColorModeToggle";
import {NavigablePage} from "../../components/layout";
import {Box, Flex} from "@chakra-ui/react";

export default function Test() {
  return <NavigablePage>
    <Flex grow={1} shrink={0}>
      <ColorModeToggle/>
      <Container><p>super test</p></Container>
    </Flex>
  </NavigablePage>
}