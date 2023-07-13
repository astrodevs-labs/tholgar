import React, { FC, useEffect } from 'react';
import { Text, VStack, GridItem, Grid } from '@chakra-ui/react';
import { Container } from 'components/ui/Container';
import { useBalance, useContractRead, useToken } from 'wagmi';
import formatNumber from 'utils/formatNumber';
import {
  redeemerAddress,
  ratioAddress,
  ratioABI,
  stakerAddress,
  vaultAddress,
  redeemerABI,
  auraAddress,
  cvxAddress
} from 'config/contracts';
import getTotalPricePerToken from 'utils/getTotalPricePerToken';

export interface StatsDisplayProps {}

export const StatsDisplay: FC<StatsDisplayProps> = () => {
  const {
    data: warBalance,
    isLoading: isWarBalanceLoading,
    isError: isWarBalanceError
  } = useBalance({
    address: vaultAddress,
    token: stakerAddress
  });

  const CirculatingSupply: FC = () => {
    const { data, isLoading, isError } = useToken({
      address: vaultAddress
    });

    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={'gray.500'}>
          {'Circulating Supply'}
        </Text>
        <Text whiteSpace={'nowrap'} fontSize={'1.5em'} fontWeight={'bold'}>
          {isLoading ? '0' : isError ? '0' : formatNumber(data!.totalSupply.formatted)}
        </Text>
      </VStack>
    );
  };

  const APY: FC = () => {
    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={'gray.500'}>
          {'APY'}
        </Text>
        <Text whiteSpace={'nowrap'} fontSize={'1.5em'} fontWeight={'bold'}>
          {'??%'}
        </Text>
      </VStack>
    );
  };

  const WARLocked: FC = () => {
    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={'gray.500'}>
          {'WAR Locked'}
        </Text>
        <Text whiteSpace={'nowrap'} fontSize={'1.5em'} fontWeight={'bold'}>
          {isWarBalanceLoading
            ? '0'
            : isWarBalanceError
            ? '0'
            : formatNumber(warBalance!.formatted)}
        </Text>
      </VStack>
    );
  };

  const TVL: FC = () => {
    const [tvl, setTvl] = React.useState<string>('0$');

    const { data: weights } = useContractRead({
      address: redeemerAddress,
      abi: redeemerABI,
      functionName: 'getTokenWeights'
    });
    const { data: auraRatio } = useContractRead({
      address: ratioAddress,
      abi: ratioABI,
      functionName: 'getTokenRatio',
      args: [auraAddress]
    });
    const { data: cvxRatio } = useContractRead({
      address: ratioAddress,
      abi: ratioABI,
      functionName: 'getTokenRatio',
      args: [cvxAddress]
    });

    async function computeTVL() {
      if (
        warBalance === undefined ||
        weights === undefined ||
        auraRatio === undefined ||
        cvxRatio === undefined
      )
        return;
      const auraWeight = (weights as any).find((weight: any) => weight.token === auraAddress);
      const cvxWeight = (weights as any).find((weight: any) => weight.token === cvxAddress);

      const auraPrice = await getTotalPricePerToken(
        (warBalance.value * auraWeight.weight) / (auraRatio as bigint) / BigInt(1e18),
        auraAddress
      );
      const cvxPrice = await getTotalPricePerToken(
        (warBalance.value * cvxWeight.weight) / (cvxRatio as bigint) / BigInt(1e18),
        cvxAddress
      );
      const total = auraPrice + cvxPrice;
      setTvl(formatNumber(total.toFixed(0).toString()) + '$');
    }

    useEffect(() => {
      computeTVL();
    }, [warBalance, weights, auraRatio, cvxRatio]);

    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={'gray.500'}>
          {'Total Volume Locked'}
        </Text>
        <Text whiteSpace={'nowrap'} fontSize={'1.5em'} fontWeight={'bold'}>
          {tvl}
        </Text>
      </VStack>
    );
  };

  return (
    <Container>
      <Grid gap={'2em'} templateColumns={'repeat(4, 1fr)'}>
        <GridItem minW={'22%'}>
          <CirculatingSupply />
        </GridItem>
        <GridItem minW={'22%'}>
          <WARLocked />
        </GridItem>
        <GridItem minW={'22%'}>
          <TVL />
        </GridItem>
        <GridItem minW={'22%'}>
          <APY />
        </GridItem>
      </Grid>
    </Container>
  );
};

StatsDisplay.defaultProps = {};
