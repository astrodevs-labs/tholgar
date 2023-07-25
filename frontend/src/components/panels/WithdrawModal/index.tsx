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
import {useStore} from "../../../store";

export interface WithdrawPanelModalProps {
  open: boolean;
  onClose: () => void;
}

export const WithdrawPanelModal: FC<WithdrawPanelModalProps> = ({
  open,
  onClose
}) => {
  const withdrawToken = useStore(state => state.withdrawToken);
  const steps = useMemo(() => {
    if (withdrawToken != 'war') {
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
  }, [withdrawToken]);
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

WithdrawPanelModal.defaultProps = {};
