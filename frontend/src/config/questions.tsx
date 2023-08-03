import {JSX} from "react";
import {Text} from "@chakra-ui/react";

export const questions : { question: string, answer: string | (() => JSX.Element)}[] = [
  {
    question: 'What is the capital of France?',
    answer: "Paris",
  },
  {
    question: 'Who is CEO of Tesla?',
    answer: () => <Text>Elon Musk</Text>,
  }
];