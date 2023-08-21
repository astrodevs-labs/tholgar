import { FC, useCallback, useEffect } from 'react';
import {
  Button,
  Flex,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import {
  useAccount,
  useContractWrite,
  useWaitForTransaction
} from 'wagmi';
import {vaultABI, vaultAddress, warAddress} from '../../../config/blockchain';
import { useStore } from '../../../store';
import {ApproveAllowance} from "../../blockchain/ApproveAllowance/Index";

export interface WarDepositModalProps {
  step: number;
  validateStep: () => void;
}

interface StepProps {
  validateStep: () => void;
  address: `0x${string}`;
}

const Step2: FC<StepProps> = ({ validateStep, address }) => {
  const warDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('war'));
  const { data, write } = useContractWrite({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'deposit'
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });
  const deposit = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [warDepositInputAmount, address]
      });
    }
  }, [isLoading, isSuccess, write, warDepositInputAmount, address]);

  useEffect(() => {
    if (isSuccess) {
      validateStep();
    }
  }, [isSuccess]);

  return (
    <Flex direction={'column'}>
      <Button
        my={5}
        onClick={deposit}
        disabled={isLoading}
        backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
        _hover={{ bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100') }}
        color={useColorModeValue('#00cf6f', 'inherit')}>
        {isLoading ? <Spinner /> : 'Deposit'}
      </Button>
    </Flex>
  );
};

export const WarDepositModal: FC<WarDepositModalProps> = ({ step, validateStep }) => {
  const { address } = useAccount();

  if (step == 0) {
    return (
    <ApproveAllowance
      token={'war'}
      tokenAddress={warAddress}
      step={step}
      validateStep={validateStep}
      address={address!}
    />
  );
  } else if (step == 1) {
    return <Step2 validateStep={validateStep} address={address!} />;
  }
};

WarDepositModal.defaultProps = {};
