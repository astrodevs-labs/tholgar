import {
  Heading,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Card,
  CardHeader,
  CardBody,
  Divider
} from '@chakra-ui/react';
import { FC } from 'react';
import { questions } from '../../config/questions';

const FAQ: FC = () => (
  <>
    <Card
      backgroundColor={useColorModeValue('background.500.light', 'background.500.dark')}
      borderRadius="lg"
      borderColor={useColorModeValue('border.light', 'border.dark')}
      margin={'2rem'}
      borderWidth="1px">
      <CardHeader>
        <Heading as="h1" size="lg">
          Frequently Asked Questions
        </Heading>
      </CardHeader>
      <Divider borderColor={useColorModeValue('border.light', 'border.dark')} />
      <CardBody>
        <Accordion allowToggle>
          {questions.map((question, index) => (
            <AccordionItem key={index} border="none">
              <AccordionButton>
                <Heading as="h2" size="ms" flex="1" textAlign="left">
                  {question.question}
                </Heading>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={2} marginLeft={4}>
                {question.answer instanceof Function ? question.answer() : question.answer}
              </AccordionPanel>
              {index < questions.length - 1 && (
                <Divider
                  margin={'1rem 0'}
                  borderColor={useColorModeValue('border.light', 'border.dark')}
                />
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </CardBody>
    </Card>
  </>
);

export default FAQ;
