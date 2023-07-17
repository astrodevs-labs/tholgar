import { FC, useMemo } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useSteps
} from '@chakra-ui/react';
import { ProgressStepper } from '../../ui/ProgressStepper';

export interface DepositPanelModalProps {
  amounts: { token: string; amount: string }[];
  depositTokens: string[];
  open: boolean;
  onClose: () => void;
}

export const DepositPanelModal: FC<DepositPanelModalProps> = ({
  // eslint-disable-next-line no-unused-vars
  amounts,
  depositTokens,
  open,
  onClose
}) => {
  const steps = useMemo(() => {
    if (depositTokens.length != 1 || depositTokens[0] != 'war') {
      return [
        {
          label: 'Approve',
          description: 'Token swap'
        },
        {
          label: 'Deposit',
          description: 'Deposit tokens'
        }
      ];
    }
    return [
      {
        label: 'Deposit',
        description: 'Deposit WAR'
      }
    ];
  }, [depositTokens]);
  const { activeStep, goToNext } = useSteps({
    index: 0,
    count: steps.length
  });

  return (
    <Modal size={'xl'} variant={'brand'} isOpen={open} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ProgressStepper stepIdx={activeStep} steps={steps} />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p>test</p>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={goToNext}>
            Secondary Action
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

DepositPanelModal.defaultProps = {};
