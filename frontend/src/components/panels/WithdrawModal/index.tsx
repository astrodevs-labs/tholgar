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

export interface WithdrawPanelModalProps {
  amounts: { token: string; amount: string }[];
  withdrawTokens: string[];
  open: boolean;
  onClose: () => void;
}

export const WithdrawPanelModal: FC<WithdrawPanelModalProps> = ({
  amounts,
  withdrawTokens,
  open,
  onClose
}) => {
  const steps = useMemo(() => {
    if (withdrawTokens.length != 1 || withdrawTokens[0] != 'war') {
      return [
        {
          label: 'Withdraw',
          description: 'Withdraw tokens'
        }
      ];
    }
    return [
      {
        label: 'Withdraw',
        description: 'Withdraw WAR'
      }
    ];
  }, [withdrawTokens]);
  const { activeStep, goToNext } = useSteps({
    index: 0,
    count: steps.length
  });
  console.log(amounts);

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

WithdrawPanelModal.defaultProps = {};
