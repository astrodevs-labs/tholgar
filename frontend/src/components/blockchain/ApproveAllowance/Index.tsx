import {FC, useCallback, useEffect} from "react";
import {inputTokenIds, useStore} from "../../../store";
import {Button, Center, Flex, HStack, Spinner, Switch, Text, useBoolean} from "@chakra-ui/react";
import {erc20ABI, useContractRead, useContractWrite, useWaitForTransaction} from "wagmi";
import {maxAllowance, zapAddress} from "../../../config/blockchain";

export interface ApproveAllowanceProps {
  token: inputTokenIds;
  tokenAddress: `0x${string}`;
  step: number;
  validateStep: () => void;
  address: `0x${string}`;
}

export const ApproveAllowance: FC<ApproveAllowanceProps> = ({ validateStep, address, tokenAddress, token}) => {
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