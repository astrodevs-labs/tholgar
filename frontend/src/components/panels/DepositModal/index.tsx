import { FC, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useSteps
} from '@chakra-ui/react';
import { ProgressStepper } from '../../ui/ProgressStepper';
import { WarDepositModal } from '../WarDepositModal';
import { AuraCvxDepositModal } from '../AuraCvxDepositModal';
import { useStore } from '../../../store';
import { EthDepositModal } from '../EthDepositModal';

export interface DepositPanelModalProps {
  depositTokens: string;
  open: boolean;
  onClose: () => void;
}

export const DepositPanelModal: FC<DepositPanelModalProps> = ({ open, onClose }) => {
  const depositTokens = useStore((state) => state.depositToken);
  const auraDepositAmount = useStore((state) => state.getDepositInputTokenAmount('aura'));
  const cvxDepositAmount = useStore((state) => state.getDepositInputTokenAmount('cvx'));
  const warDepositAmount = useStore((state) => state.getDepositInputTokenAmount('war'));
  const resetBalances = useStore((state) => state.resetBalances);
  const resetStats = useStore((state) => state.resetStats);
  const resetTokenInfos = useStore((state) => state.resetTokenInfos);
  const steps = useMemo(() => {
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
    else if (depositTokens == 'aura/cvx') {
      let steps = [];

      if (auraDepositAmount > 0) {
        steps.push({
          label: 'Approve AURA',
          description: 'Token swap'
        });
      }

      if (cvxDepositAmount > 0) {
        steps.push({
          label: 'Approve CVX',
          description: 'Token swap'
        });
      }

      return [
        ...steps,
        {
          label: 'Deposit',
          description: 'Deposit tokens'
        }
      ];
    } else {
      return [
        {
          label: 'Swap & Deposit',
          description: 'Swap token for vlTokens and deposit'
        }
      ];
    }
  }, [depositTokens, auraDepositAmount, cvxDepositAmount]);
  const { activeStep, goToNext } = useSteps({
    index: 0,
    count: steps.length
  });

  useEffect(() => {
    if (activeStep == steps.length) {
      resetBalances();
      resetStats();
      resetTokenInfos('tWAR');
      onClose();
    }
  }, [activeStep, steps, resetBalances, resetStats, onClose]);

  useEffect(() => {
    if (depositTokens == 'war' && warDepositAmount === 0n) {
      onClose();
    } else if (
      depositTokens === 'aura/cvx' &&
      auraDepositAmount === 0n &&
      cvxDepositAmount === 0n
    ) {
      onClose();
    }
  }, [depositTokens, auraDepositAmount, cvxDepositAmount, warDepositAmount]);

  return (
    <Modal size={'xl'} variant={'brand'} isOpen={open} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ProgressStepper stepIdx={activeStep} steps={steps} />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {depositTokens == 'war' && <WarDepositModal step={activeStep} validateStep={goToNext} />}
          {depositTokens === 'aura/cvx' && (
            <AuraCvxDepositModal step={activeStep} validateStep={goToNext} />
          )}
          {depositTokens === 'eth' && <EthDepositModal step={activeStep} validateStep={goToNext} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

DepositPanelModal.defaultProps = {};
