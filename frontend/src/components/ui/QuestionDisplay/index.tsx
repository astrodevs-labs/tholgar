import { FC, JSX } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export interface QuestionDisplayProps {
  question: string;
  answer: string | (() => JSX.Element),
}

export const QuestionDisplay: FC<QuestionDisplayProps> = ({ question, answer }) => {
  return (
    <Box p={3}>
      <Heading size={'md'}>{question}</Heading>
      
        {typeof answer === 'string' ? <Text>{answer}</Text> : answer()}
      
    </Box>
  );
};

QuestionDisplay.defaultProps = {};
