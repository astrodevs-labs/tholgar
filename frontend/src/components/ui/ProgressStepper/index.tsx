import { FC } from 'react';
import {
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle
} from '@chakra-ui/react';

export interface ProgressStepperProps {
  stepIdx: number;
  steps: { label: string; description: string }[];
}

export const ProgressStepper: FC<ProgressStepperProps> = ({ stepIdx, steps }) => (
  <Stepper index={stepIdx} colorScheme="green">
    {steps.map((step, index) => (
      <Step key={index}>
        <StepIndicator>
          <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
        </StepIndicator>

        <Box flexShrink="0">
          <StepTitle>{step.label}</StepTitle>
          <StepDescription>{step.description}</StepDescription>
        </Box>

        <StepSeparator />
      </Step>
    ))}
  </Stepper>
);

ProgressStepper.defaultProps = {};
