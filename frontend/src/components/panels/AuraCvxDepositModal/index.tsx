import { FC, useCallback, useEffect } from 'react';
import { Button, Center, Flex, HStack, Spinner, Switch, Text, useBoolean } from '@chakra-ui/react';
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useContractRead,
  useWaitForTransaction
} from 'wagmi';
import {
  maxAllowance,
  auraAddress,
  cvxAddress,
  zapAddress,
  zapABI
} from '../../../config/blockchain';
import { inputTokenIds, useStore } from '../../../store';

export interface AuraCvxDepositModalProps {
  step: number;
  validateStep: () => void;
}

interface StepProps {
  validateStep: () => void;
  address: `0x${string}`;
}

const Step1: FC<StepProps & { tokenAddress: `0x${string}`; token: inputTokenIds }> = ({
  validateStep,
  address,
  tokenAddress,
  token
}) => {
  const tokenDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount(token));
  const [allowTotal, setAllowTotal] = useBoolean(false);
  const { data, write } = useContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve'
  });
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });
  const allowanceRes = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, zapAddress]
  });
  const allow = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [zapAddress, allowTotal ? maxAllowance : tokenDepositInputAmount]
      });
    }
  }, [tokenDepositInputAmount, allowTotal, token]);

  useEffect(() => {
    if (isSuccess) {
      validateStep();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (allowanceRes.data && allowanceRes.data > tokenDepositInputAmount) validateStep();
  }, [allowanceRes]);

  return (
    <Flex direction={'column'}>
      <HStack>
        <Text>Allowance type : </Text>
        <Center>
          <HStack>
            <Text>Deposit amount</Text>
            <Switch onChange={setAllowTotal.toggle} />
            <Text>Max allowance</Text>
          </HStack>
        </Center>
      </HStack>
      <Button my={5} onClick={allow} disabled={isLoading}>
        {isLoading ? <Spinner /> : 'Approve'}
      </Button>
      <Button my={5} onClick={validateStep}>
        Next
      </Button>
    </Flex>
  );
};

const Step2: FC<StepProps> = ({ validateStep, address }) => {
  const auraDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('aura'));
  const cvxDepositInputAmount = useStore((state) => state.getDepositInputTokenAmount('cvx'));
  const { data, write } = useContractWrite({
    address: zapAddress,
    abi: zapABI,
    functionName: 'zapMultiple'
  });
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });
  const deposit = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [[auraAddress, cvxAddress], [auraDepositInputAmount, cvxDepositInputAmount], address]
      });
    }
  }, [auraDepositInputAmount, cvxDepositInputAmount]);

  useEffect(() => {
    if (isSuccess) {
      validateStep();
    }
  }, [isSuccess]);

  return (
    <Flex direction={'column'}>
      <Button my={5} onClick={deposit} disabled={isLoading}>
        {isLoading ? <Spinner /> : 'Deposit'}
      </Button>
    </Flex>
  );
};

export const AuraCvxDepositModal: FC<AuraCvxDepositModalProps> = ({ step, validateStep }) => {
  const { address } = useAccount();

  if (step == 0) {
    return (
      <Step1
        validateStep={validateStep}
        address={address!}
        tokenAddress={auraAddress}
        token={'aura'}
      />
    );
  } else if (step == 1) {
    return (
      <Step1
        validateStep={validateStep}
        address={address!}
        tokenAddress={cvxAddress}
        token={'cvx'}
      />
    );
  } else if (step == 2) {
    return <Step2 validateStep={validateStep} address={address!} />;
  }
};

AuraCvxDepositModal.defaultProps = {};
