import {FC, useCallback, useEffect,} from 'react';
import {Button, Center, Flex, HStack, Spinner, Switch, Text, useBoolean} from '@chakra-ui/react';
import {erc20ABI, useAccount, useContractWrite, useContractRead, useWaitForTransaction} from "wagmi";
import {
  maxAllowance,
  auraAddress,
  cvxAddress,
  zapAddress,
  zapABI
} from "../../../config/blockchain";
import convertFormattedToBigInt from 'utils/convertFormattedToBigInt';

export interface AuraCvxDepositModalProps {
  amounts: { token: string; amount: string }[];
  step: number;
  validateStep: () => void;
}

interface StepProps {
  amounts: { token: string; amount: string }[];
  validateStep: () => void;
  address: `0x${string}`;
}

const Step1: FC<StepProps & {tokenAddress : `0x${string}`, token: string}> = ({ amounts, validateStep, address, tokenAddress, token }) => {
  const [allowTotal, setAllowTotal] = useBoolean(false);
  const {  data, write } = useContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
  })
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  })
  const allowanceRes = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, zapAddress]
  })
  const allow = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [zapAddress, allowTotal ? maxAllowance : convertFormattedToBigInt(amounts.find((am) => am.token == token)?.amount!, 18)],
      });
    }
  }, [amounts, allowTotal, token]);

  useEffect(() => {
    if (isSuccess) {
      console.log(data);
      validateStep();
    }
  }, [isSuccess])

  useEffect(() => {
    if (allowanceRes.data && allowanceRes.data > BigInt(amounts[0].amount!))
      validateStep()
  }, [allowanceRes]);

  return (
    <Flex direction={'column'}>
      <HStack>
        <Text>Allowance type : </Text>
        <Center>
          <HStack>
            <Text>Deposit amount</Text>
            <Switch onChange={setAllowTotal.toggle}/>
            <Text>Max allowance</Text>
          </HStack>
        </Center>
      </HStack>
      <Button my={5} onClick={allow} disabled={isLoading}>{isLoading ? <Spinner/> : "Approve"}</Button>
      <Button my={5} onClick={validateStep}>Next</Button>
    </Flex>
  );

}

const Step2: FC<StepProps> = ({ amounts, validateStep, address}) => {
  const {  data, write } = useContractWrite({
    address: zapAddress,
    abi: zapABI,
    functionName: 'zapMultiple',
  })
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  })
  const deposit = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [
          [auraAddress, cvxAddress], 
          [
            convertFormattedToBigInt(amounts.find((am) => am.token == 'aura')?.amount!, 18), 
            convertFormattedToBigInt(amounts.find((am) => am.token == 'cvx')?.amount!, 18)
          ], 
          address
        ],
      });
    }
  }, [amounts, validateStep]);

  useEffect(() => {
    if (isSuccess) {
      console.log(data);
      validateStep();
    }
  }, [isSuccess])

  return (
    <Flex direction={'column'}>
      <Button my={5} onClick={deposit} disabled={isLoading}>{isLoading ? <Spinner/> : "Deposit"}</Button>
    </Flex>
  );
}

export const AuraCvxDepositModal: FC<AuraCvxDepositModalProps> = ({ amounts, step, validateStep }) => {
  const { address } = useAccount();

  if (step == 0) {
    return <Step1 amounts={amounts} validateStep={validateStep} address={address!} tokenAddress={auraAddress} token={'aura'}/>;
  } else if (step == 1) {
    return <Step1 amounts={amounts} validateStep={validateStep} address={address!} tokenAddress={cvxAddress} token={'cvx'}/>;
  } else if (step == 2) {
    return <Step2 amounts={amounts} validateStep={validateStep} address={address!}/>;
  }
};

AuraCvxDepositModal.defaultProps = {};
