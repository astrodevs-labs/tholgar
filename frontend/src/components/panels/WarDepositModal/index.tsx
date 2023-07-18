import {FC, useCallback, useEffect,} from 'react';
import {Button, Center, Flex, HStack, Spinner, Switch, Text, useBoolean} from '@chakra-ui/react';
import {erc20ABI, useAccount, useContractWrite, useContractRead} from "wagmi";
import {maxAllowance, vaultABI, vaultAddress, warAddress} from "../../../config/blockchain";

export interface WarDepositModalProps {
  amounts: { token: string; amount: string }[];
  step: number;
  validateStep: () => void;
}

interface StepProps {
  amounts: { token: string; amount: string }[];
  validateStep: () => void;
  address: `0x${string}`;
}

const Step1: FC<StepProps> = ({ amounts, validateStep, address }) => {
  const [allowTotal, setAllowTotal] = useBoolean(false);
  const {  data, isLoading, isSuccess, write } = useContractWrite({
    address: warAddress,
    abi: erc20ABI,
    functionName: 'approve',
  })
  const allowanceRes = useContractRead({
    address: warAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, vaultAddress]
  })
  const allow = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [vaultAddress, BigInt(allowTotal ? maxAllowance : amounts.find((am) => am.token == 'war')?.amount || '0')],
      });
    } else if (isSuccess) {
      console.log(data);
      validateStep();
    }
  }, [amounts, allowTotal]);

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
  const {  data, isLoading, isSuccess, write } = useContractWrite({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'deposit',
  })
  const deposit = useCallback(() => {
    if (!isLoading && !isSuccess) {
      write({
        args: [BigInt(amounts.find((am) => am.token == 'war')?.amount || '0'), address],
      });
    } else if (isSuccess) {
      console.log(data);
      validateStep();
    }
  }, [amounts, validateStep]);

  return (
    <Flex direction={'column'}>
      <Button my={5} onClick={deposit}disabled={isLoading}>{isLoading ? <Spinner/> : "Deposit"}</Button>
    </Flex>
  );
}

export const WarDepositModal: FC<WarDepositModalProps> = ({ amounts, step, validateStep }) => {
  const { address } = useAccount();

  if (step == 0) {
    return <Step1 amounts={amounts} validateStep={validateStep} address={address!}/>;
  } else if (step == 1) {
    return <Step2 amounts={amounts} validateStep={validateStep} address={address!}/>;
  }
};

WarDepositModal.defaultProps = {};
