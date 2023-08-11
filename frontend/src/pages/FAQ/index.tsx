import {
  Heading,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  CardHeader,
  CardBody,
  Divider,
  Card
} from '@chakra-ui/react';
import { FC } from 'react';
import { questions } from '../../config/questions';

const FAQ: FC = () => (
  <>
    <Card
      backgroundColor={useColorModeValue('background.500.light', 'background.500.dark')}
      borderRadius="1.5em"
      borderColor={useColorModeValue('border.light', 'border.dark')}
      borderWidth="1px"
      p={'1.25em'}
      mt={'1.25em'}
      mb={'1.25em'}
      mx={'4em'}
      boxSizing="border-box">
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
