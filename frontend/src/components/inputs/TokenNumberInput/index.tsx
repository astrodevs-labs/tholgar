import { FC, useEffect, useState } from 'react';
import { Container } from 'components/ui/Container';
import { Flex, HStack, Input, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { BalanceDisplay } from '../../blockchain/BalanceDisplay';
import { TokenDisplay } from '../../ui/TokenDisplay';

export interface TokenNumberInputProps {
  token: `0x${string}`;
  ticker: string;
  iconUrl: string;
  value?: string;
  // eslint-disable-next-line no-unused-vars
  onInputChange: (value: string) => void;
  onInputClear: () => void;
  onMaxClick: () => void;
}

export const TokenNumberInput: FC<TokenNumberInputProps> = ({
  token,
  ticker,
  iconUrl,
  value,
  onInputChange,
  onInputClear,
  onMaxClick
}) => {
  const [inputValue, setInputValue] = useState<string | undefined>(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Container
      p={2}
      backgroundColor={useColorModeValue('background.200.light', 'background.200.dark')}
    >
      <Flex justify={'space-between'}>
        <VStack align={'start'}>
          <Input
            fontSize={'1.5em'}
            placeholder={'0.00'}
            variant={'unstyled'}
            colorScheme={'whiteAlpha'}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value.length === 0)  {
                onInputClear();
                return;
              }
              if (e.target.value.match(/[^0-9.]/g)) return;
              onInputChange(e.target.value);
            }}
          />
          <HStack>
            <BalanceDisplay description={'Balance :'} token={token} inline={true} />
            <Text cursor={'pointer'} textShadow={'0px 0px 5px var(--chakra-colors-brand-primary-300)'} textColor={"brand.primary.300"}  onClick={() => onMaxClick()}>
              MAX
            </Text>
          </HStack>
        </VStack>
        <VStack justify={'center'}>
          <TokenDisplay tokenIconUrl={iconUrl} ticker={ticker} />
        </VStack>
      </Flex>
    </Container>
  );
};

TokenNumberInput.defaultProps = {};
