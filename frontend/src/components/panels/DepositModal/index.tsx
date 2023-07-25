import { FC, useMemo } from 'react';
import {
  // Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  // ModalFooter,
  ModalHeader,
  ModalOverlay,
  useSteps
} from '@chakra-ui/react';
import { ProgressStepper } from '../../ui/ProgressStepper';
import { WarDepositModal } from '../WarDepositModal';
import { AuraCvxDepositModal } from '../AuraCvxDepositModal';
import { useStore } from '../../../store';

export interface DepositPanelModalProps {
  depositTokens: string;
  open: boolean;
  onClose: () => void;
}

export const DepositPanelModal: FC<DepositPanelModalProps> = ({ open, onClose }) => {
  const depositTokens = useStore((state) => state.depositToken);
  const steps = useMemo(() => {
    console.log('depositTokens', depositTokens);
    if (depositTokens == 'war')
      return [
        {
          label: 'Approve',
          description: 'Token swap'
        },
        {
          label: 'Deposit',
          description: 'Deposit token'
        }
      ];
    else
      return [
        {
          label: 'Approve AURA',
          description: 'Token swap'
        },
        {
          label: 'Approve CVX',
          description: 'Token swap'
        },
        {
          label: 'Deposit',
          description: 'Deposit tokens'
        }
      ];
  }, [depositTokens]);
  const { activeStep, goToNext } = useSteps({
    index: 0,
    count: steps.length
  });

  console.log('step: ', activeStep);

  return (
    <Modal size={'xl'} variant={'brand'} isOpen={open} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ProgressStepper stepIdx={activeStep} steps={steps} />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {depositTokens == 'war' ? (
            <WarDepositModal step={activeStep} validateStep={goToNext} />
          ) : (
            <AuraCvxDepositModal step={activeStep} validateStep={goToNext} />
          )}
        </ModalBody>

        {/*<ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={goToNext}>
            Secondary Action
          </Button>
        </ModalFooter>*/}
      </ModalContent>
    </Modal>
  );
};

DepositPanelModal.defaultProps = {};
