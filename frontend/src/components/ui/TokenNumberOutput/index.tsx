import { FC } from 'react';
import {Container} from "components/ui/Container";
import {Flex, VStack, Text} from "@chakra-ui/react";
import {TokenDisplay} from "../TokenDisplay";

export interface TokenNumberOutputProps {
  ticker: string;
  iconUrl: string;
  value?: string;
}

export const TokenNumberOutput: FC<TokenNumberOutputProps> = ({ticker, iconUrl, value}) => (
  <Container p={2}>
    <Flex justify={"space-between"}>
      <VStack align={"start"} justify={"center"}>
        <Text size={"lg"}>{value ?? "0.00"}</Text>
      </VStack>
      <VStack justify={"center"}>
        <TokenDisplay tokenIconUrl={iconUrl} ticker={ticker}/>
      </VStack>
    </Flex>
  </Container>
);

TokenNumberOutput.defaultProps = {};
