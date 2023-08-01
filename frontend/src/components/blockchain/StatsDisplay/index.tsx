import React, { FC, useEffect } from 'react';
import { Text, VStack, GridItem, Grid, useColorModeValue } from '@chakra-ui/react';
import { Container } from 'components/ui/Container';
import { useBalance, useContractRead, useToken } from 'wagmi';
import formatNumber from 'utils/formatNumber';
import {
  redeemerAddress,
  ratioAddress,
  warRatioABI,
  stakerAddress,
  vaultAddress,
  warRedeemerABI,
  auraAddress,
  cvxAddress
} from 'config/blockchain';
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

  const infoColor = useColorModeValue('black', 'white');

  const CirculatingSupply: FC = () => {
    const { data, isLoading, isError } = useToken({
      address: vaultAddress
    });

    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'Circulating Supply'}
        </Text>
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip="text"
          bgGradient={'linear(to-r, brand.primary, white)'}
        >
          {isLoading ? '0' : isError ? '0' : formatNumber(data!.totalSupply.formatted)}
        </Text>
      </VStack>
    );
  };

  const APY: FC = () => {
    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'APY'}
        </Text>
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip="text"
          bgGradient={'linear(to-r, brand.primary, white)'}
        >
          {'??%'}
        </Text>
      </VStack>
    );
  };

  const WARLocked: FC = () => {
    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'WAR Locked'}
        </Text>
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip={'text'}
          bgGradient={'linear(to-r, brand.primary, white)'}
        >
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
      abi: warRedeemerABI,
      functionName: 'getTokenWeights'
    });
    const { data: auraRatio } = useContractRead({
      address: ratioAddress,
      abi: warRatioABI,
      functionName: 'getTokenRatio',
      args: [auraAddress]
    });
    const { data: cvxRatio } = useContractRead({
      address: ratioAddress,
      abi: warRatioABI,
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
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'Total Volume Locked'}
        </Text>
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip={'text'}
          bgGradient={'linear(to-r, brand.primary, white)'}
        >
          {tvl}
        </Text>
      </VStack>
    );
  };

  return (
    <Container mx={'4em'}>
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
