import { FC, useCallback, useEffect } from 'react';
import { Button, Center, Flex, HStack, Spinner, Switch, Text, useBoolean } from '@chakra-ui/react';
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useContractRead,
  useWaitForTransaction
} from 'wagmi';
import { maxAllowance, vaultABI, vaultAddress, warAddress } from '../../../config/blockchain';
import { useStore } from '../../../store';

export interface WarDepositModalProps {
  step: number;
  validateStep: () => void;
}

interface StepProps {
  validateStep: () => void;
  address: `0x${string}`;
}

const Step1: FC<StepProps> = ({ validateStep, address }) => {
  const warDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('war'));
  const [allowTotal, setAllowTotal] = useBoolean(false);
  const [validated, setValidated] = useBoolean(false);
  const { data, write } = useContractWrite({
    address: warAddress,
    abi: erc20ABI,
    functionName: 'approve'
  });
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });
  const { data: allowanceResData } = useContractRead({
    address: warAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, vaultAddress]
  });
  const allow = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [vaultAddress, allowTotal ? maxAllowance : warDepositInputAmount]
      });
    }
  }, [warDepositInputAmount, allowTotal]);

  useEffect(() => {
    if (isSuccess) {
      validateStep();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (allowanceResData && allowanceResData >= warDepositInputAmount && !validated) {
      setValidated.on();
      validateStep();
    }
  }, [allowanceResData, validated]);

  return (
    <Flex direction={'column'}>
      <HStack>
        <Text>Allowance type : </Text>
        <Center>
          <HStack>
            <Text>Deposit amount</Text>
            <Switch onChange={setAllowTotal.toggle} colorScheme="green" />
            <Text>Max allowance</Text>
          </HStack>
        </Center>
      </HStack>
      <Button
        my={5}
        onClick={allow}
        disabled={isLoading}
        bgColor={'brand.primary.300'}
        _hover={{ bgColor: 'brand.primary.100' }}
      >
        {isLoading ? <Spinner /> : 'Approve'}
      </Button>
    </Flex>
  );
};

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
  }, [warDepositInputAmount, validateStep]);

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
        bgColor={'brand.primary.300'}
        _hover={{ bgColor: 'brand.primary.100' }}
      >
        {isLoading ? <Spinner /> : 'Deposit'}
      </Button>
    </Flex>
  );
};

export const WarDepositModal: FC<WarDepositModalProps> = ({ step, validateStep }) => {
  const { address } = useAccount();

  if (step == 0) {
    return <Step1 validateStep={validateStep} address={address!} />;
  } else if (step == 1) {
    return <Step2 validateStep={validateStep} address={address!} />;
  }
};

WarDepositModal.defaultProps = {};
