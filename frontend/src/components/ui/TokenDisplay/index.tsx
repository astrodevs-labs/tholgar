import { FC } from 'react';
import { HStack, Image, Text } from '@chakra-ui/react';
import { Container } from '../Container';

export interface TokenDisplayProps {
  /**
   * @property tokenIconUrl The token icon url to display
   */
  tokenIconUrl: string;

  /**
   * @property ticker The token ticker
   */
  ticker: string;
}

export const TokenDisplay: FC<TokenDisplayProps> = ({ tokenIconUrl, ticker }) => (
  <Container p={2} backgroundColor={'brand.secondary'}>
    <HStack>
      <Image src={tokenIconUrl} alt={ticker} w={'24px'} />
      <Text fontSize={'l'} fontWeight={'medium'} >{ticker}</Text>
    </HStack>
  </Container>
);

TokenDisplay.defaultProps = {};
