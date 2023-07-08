import { FC } from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';

export interface InputProps {
  /**
   * @property {number} caption - The caption of the input
   */
  caption: () => void;
}

export const Input: FC<InputProps> = ({ caption }) => {
  return (
    <VStack>
    </VStack>
  );
};

Input.defaultProps = {};
