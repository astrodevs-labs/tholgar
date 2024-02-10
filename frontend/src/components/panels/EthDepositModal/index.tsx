import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import {
  auraAddress,
  cvxAddress,
  vaultABI,
  vaultAddress,
  wethAddress,
  zapperABI,
  zapperAddress
} from '../../../config/blockchain';
import { useStore } from '../../../store';
import useParaswapPrices from '../../../hooks/useParaswapPrice';
import useTokenRatio from '../../../hooks/useTokenRatio';
import useParaswapTransaction from '../../../hooks/useParaswapTransaction';

export interface EthDepositModalProps {
  step: number;
  validateStep: () => void;
}

export const EthDepositModal: FC<EthDepositModalProps> = ({ step, validateStep }) => {
  const { address } = useAccount();
  const [slippage, setSlippage] = useState(5);
  const [timeout, setTimeout] = useState(24 * 60);
  const [invalid, setInvalid] = useState(false);
  const ethDepositAmount = useStore((state) => state.getDepositInputTokenAmount('eth'));
  const auraRatio = useTokenRatio(auraAddress);
  const cvxRatio = useTokenRatio(cvxAddress);

  const {
    data: auraData,
    error: auraError,
    isLoading: auraLoading
  } = useParaswapPrices({
    amount: ethDepositAmount,
    srcToken: wethAddress,
    destToken: auraAddress,
    srcDecimals: 18,
    destDecimals: 18
  });
  const {
    data: cvxData,
    error: cvxError,
    isLoading: cvxLoading
  } = useParaswapPrices({
    amount: ethDepositAmount,
    srcToken: wethAddress,
    destToken: cvxAddress,
    srcDecimals: 18,
    destDecimals: 18
  });
  const best = useMemo(() => {
    if (!auraData || !cvxData || auraRatio === undefined || cvxRatio === undefined)
      return undefined;
    const auraAmountInWar =
      (BigInt(auraData.priceRoute.destAmount) * (auraRatio as bigint)) / BigInt(1e18);
    const cvxAmountInWar =
      (BigInt(cvxData.priceRoute.destAmount) * (cvxRatio as bigint)) / BigInt(1e18);

    return auraAmountInWar > cvxAmountInWar
      ? { token: auraAddress, bestRoute: auraData.priceRoute }
      : { token: cvxAddress, bestRoute: cvxData.priceRoute };
  }, [auraData, cvxData, auraRatio, cvxRatio]);
  const { data, write } = useContractWrite({
    address: zapperAddress,
    abi: zapperABI,
    functionName: 'zapEtherToSingleToken',
    value: ethDepositAmount
  });
  const txParam = useParaswapTransaction(
    address,
    best?.bestRoute,
    slippage * 100,
    timeout * 60 * 1000
  );
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });
  const deposit = useCallback(() => {
    if (!isLoading && !isSuccess && best && txParam && address) {
      write({
        args: [best.token, address, txParam]
      });
    }
  }, [isLoading, isSuccess, write, best, txParam, address]);

  useEffect(() => {
    if (isSuccess) {
      // setTimeout(validateStep, 5000);
      validateStep();
    }
  }, [isSuccess]);

  return (
    <VStack gap={4}>
      <InputGroup>
        <InputLeftAddon children="Slippage (%)" />
        <NumberInput
          value={slippage}
          step={0.1}
          clampValueOnBlur={false}
          keepWithinRange={false}
          pattern="^\d*(\.\d*)?$"
          onInvalid={() => setInvalid(true)}
          max={100}
          onChange={(_, value) => {
            setInvalid(false);
            setSlippage(value);
          }}
          w="full">
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>
      <InputGroup w={'100%'}>
        <InputLeftAddon children="Timeout (minutes)" />
        <NumberInput
          value={timeout}
          min={10}
          step={10}
          onChange={(_, value) => setTimeout(value)}
          w={'full'}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>
      <Button
        my={5}
        w={'full'}
        onClick={deposit}
        disabled={!best || !txParam || invalid}
        backgroundColor={useColorModeValue('brand.primary.200', 'brand.primary.300')}
        _hover={{ bgColor: useColorModeValue('brand.primary.300', 'brand.primary.100') }}
        color={useColorModeValue('#00cf6f', 'inherit')}>
        {!best || !txParam ? <Spinner /> : 'Deposit'}
      </Button>
    </VStack>
  );
};

EthDepositModal.defaultProps = {};
