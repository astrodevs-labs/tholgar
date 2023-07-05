import {FC} from "react";
import {Box, HStack, Text, VStack} from "@chakra-ui/react";

export interface CaptionedNumberProps {
  /**
   * @property caption The number caption/description
   */
  caption: string;

  /**
   * @property number The number to display
   */
  number: number;

  /**
   * @property symbol The number symbol
   */
  symbol?: string;
}

export const CaptionedNumber: FC<CaptionedNumberProps> = ({caption, number, symbol}) => {

  return (
    <VStack>
      <Text size={"l"}>{caption}</Text>
      <HStack>
        <Text size={"l"}>{number}</Text>
        {symbol && <Text size={"l"}>{symbol}</Text>}
      </HStack>
    </VStack>
  )
}

CaptionedNumber.defaultProps = {}