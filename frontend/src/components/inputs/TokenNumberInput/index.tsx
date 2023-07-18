import { FC } from 'react';
import { Container } from 'components/ui/Container';
import { Flex, HStack, Input, VStack, Text } from '@chakra-ui/react';
import { BalanceDisplay } from '../../blockchain/BalanceDisplay';
import { TokenDisplay } from '../../ui/TokenDisplay';

export interface TokenNumberInputProps {
  token: `0x${string}`;
  ticker: string;
  iconUrl: string;
  value?: string;
  // eslint-disable-next-line no-unused-vars
  onInputChange: (value: string) => void;
  // eslint-disable-next-line no-unused-vars
  onBalanceRetrieval: (balance: string) => void;
  onMaxClick: () => void;
}

export const TokenNumberInput: FC<TokenNumberInputProps> = ({
  token,
  ticker,
  iconUrl,
  value,
  onInputChange,
  onBalanceRetrieval,
  onMaxClick
}) => (
  <Container p={2}>
    <Flex justify={'space-between'}>
      <VStack align={'start'}>
        <Input
          fontSize={'1.5em'}
          placeholder={'0.00'}
          variant={'unstyled'}
          colorScheme={'whiteAlpha'}
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <HStack>
          <BalanceDisplay
            description={'Balance :'}
            token={token}
            inline={true}
            onBalanceRetrieval={onBalanceRetrieval}
          />
          <Text fontSize={'l'} onClick={() => onMaxClick()}>
            Max
          </Text>
        </HStack>
      </VStack>
      <VStack justify={'center'}>
        <TokenDisplay tokenIconUrl={iconUrl} ticker={ticker} />
      </VStack>
    </Flex>
  </Container>
);

TokenNumberInput.defaultProps = {};
