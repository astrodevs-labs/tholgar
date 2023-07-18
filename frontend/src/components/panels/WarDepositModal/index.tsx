import {FC, useCallback,} from 'react';
import {Button, Center, Flex, HStack, Switch, Text, useBoolean} from '@chakra-ui/react';
import {erc20ABI, useAccount, useContractWrite} from "wagmi";
import {maxAllowance, vaultAddress, warAddress} from "../../../config/blockchain";
import {WalletConnectButton} from "../../blockchain/WalletConnectButton";

export interface WarDepositModalProps {
  amounts: { token: string; amount: string }[];
  step: number;
  validateStep: () => void;
}

interface StepProps {
  amounts: { token: string; amount: string }[];
  validateStep: () => void;
  address?: string;
  isConnected: boolean;
}

const Step1: FC<StepProps> = ({ amounts, validateStep, isConnected }) => {
  const [allowTotal, setAllowTotal] = useBoolean(false);
  const {  data, isLoading, isSuccess, write } = useContractWrite({
    address: warAddress,
    abi: erc20ABI,
    functionName: 'approve',
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
      {
        isConnected ? (
          <Button my={5} onClick={allow}>Next</Button>
        ) : (
          <WalletConnectButton my={5} w={"100%"} />
        )
      }
    </Flex>
  );

}

export const WarDepositModal: FC<WarDepositModalProps> = ({ amounts, step, validateStep }) => {
  const { address, isConnected } = useAccount();

  if (step == 0) {
    return <Step1 amounts={amounts} validateStep={validateStep} address={address} isConnected={isConnected}/>;
  }
};

WarDepositModal.defaultProps = {};
