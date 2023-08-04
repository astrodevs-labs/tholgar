import { Divider, Heading } from '@chakra-ui/react';
import { FC } from 'react';
import { QuestionDisplay } from 'components/ui/QuestionDisplay';
import { questions } from '../../config/questions';

const FAQ: FC = () => (
  <>
    <Heading size={'lg'} marginBottom={3}>
      Frequently Asked Questions
    </Heading>
    {questions.map((question, index) => (
      <>
        <QuestionDisplay key={index} question={question.question} answer={question.answer} />
        {index !== questions.length - 1 && <Divider />}
      </>
    ))}
  </>
);

export default FAQ;
