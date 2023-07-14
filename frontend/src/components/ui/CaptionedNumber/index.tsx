import { FC } from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';

export interface CaptionedNumberProps {
  /**
   * @property caption The number caption/description
   */
  caption: string;

  /**
   * @property number The number to display
   */
  number: number | string;

  /**
   * @property symbol The number symbol
   */
  symbol?: string;

  inline?: boolean;
}

export const CaptionedNumber: FC<CaptionedNumberProps> = ({ caption, number, symbol, inline }) => {
  const inner = <>
      <Text size={'l'}>{caption}</Text>
      <HStack>
        <Text size={'l'}>{number}</Text>
        {symbol && <Text size={'l'}>{symbol}</Text>}
      </HStack>
    </>;

  return inline ? <HStack>{inner}</HStack> : <VStack>{inner}</VStack>;
};

CaptionedNumber.defaultProps = {
  inline: false
};
