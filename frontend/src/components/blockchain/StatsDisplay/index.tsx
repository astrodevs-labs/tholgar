import React, { FC, useEffect } from 'react';
import { Text, VStack, GridItem, Grid, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { Container } from 'components/ui/Container';
import { useBalance, useContractRead, useToken } from 'wagmi';
import formatNumber from 'utils/formatNumber';
import {
  stakerAddress,
  vaultAddress,
  auraAddress,
  cvxAddress,
  warStakerABI,
  warAddress,
  cvxCrvAddress,
  auraBalAddress,
  wethAddress,
  warCvxLocker,
  warLockerAbi,
  warAuraLocker
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
  const { data: cvxLocked } = useContractRead({
    address: warCvxLocker,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens',
  });
  const { data: auraLocked } = useContractRead({
    address: warAuraLocker,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens',
  });


  const textProps =
    useColorMode().colorMode === 'light'
      ? { color: 'brand.primary.300' }
      : { bgGradient: 'linear(to-r, brand.primary.300, white)' };
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
          {...textProps}
        >
          {isLoading ? '0' : isError ? '0' : formatNumber(data!.totalSupply.formatted)}
        </Text>
      </VStack>
    );
  };

  const APY: FC = () => {
    const [apy, setApy] = React.useState<string>('0.00%');

    const { data: cvxCrvRates } = useContractRead({
      address: stakerAddress,
      abi: warStakerABI,
      functionName: 'rewardStates',
      args: [cvxCrvAddress]
    });
    const { data: auraBalRates } = useContractRead({
      address: stakerAddress,
      abi: warStakerABI,
      functionName: 'rewardStates',
      args: [auraBalAddress]
    });
    const { data: warRates } = useContractRead({
      address: stakerAddress,
      abi: warStakerABI,
      functionName: 'rewardStates',
      args: [warAddress]
    });
    const { data: wethRates } = useContractRead({
      address: stakerAddress,
      abi: warStakerABI,
      functionName: 'rewardStates',
      args: [wethAddress]
    });

    async function computeAPY() {
      if (cvxCrvRates === undefined || auraBalRates === undefined || warRates === undefined || wethRates === undefined) return;

      const wethAmount = ((wethRates) as bigint[])[3] * 604800n * 4n * 12n;
      const warAmount = ((warRates) as bigint[])[3] * 604800n * 4n * 12n;
      const auraAmount = ((auraBalRates) as bigint[])[3] * 604800n * 4n * 12n;
      const cvxCrvAmount = ((cvxCrvRates) as bigint[])[3] * 604800n * 4n * 12n;

      const wethDollar = await getTotalPricePerToken(wethAmount / BigInt(1e18), wethAddress);
      const warDollar = await getTotalPricePerToken(warAmount / BigInt(1e18), warAddress);
      const auraDollar = await getTotalPricePerToken(auraAmount / BigInt(1e18), auraAddress);
      const cvxCrvDollar = await getTotalPricePerToken(cvxCrvAmount / BigInt(1e18), cvxCrvAddress);

      const dollarValue = wethDollar + auraDollar + cvxCrvDollar + warDollar;

      const warlordTVL = await getTotalPricePerToken(cvxLocked as bigint / BigInt(1e18), cvxAddress) + await getTotalPricePerToken(auraLocked as bigint / BigInt(1e18), auraAddress);

      const apr = dollarValue / warlordTVL;
      const apy = (1 + apr / 48) ** 48 - 1;
      setApy((apy * 100).toFixed(2) + '%');
    }

    useEffect(() => {
      computeAPY();
    }, [cvxCrvRates, auraBalRates, warRates, wethRates])
  
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
          {...textProps}
        >
          {apy}
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
          {...textProps}
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

    const { data: staker } = useToken({
      address: stakerAddress
    });

    async function computeTVL() {
      if (
        cvxLocked === undefined ||
        auraLocked === undefined ||
        warBalance === undefined ||
        staker === undefined
      ) return;
      const auraPrice = await getTotalPricePerToken(
        auraLocked as bigint * warBalance.value / staker.totalSupply.value / BigInt(1e18),
        auraAddress
      );
      const cvxPrice = await getTotalPricePerToken(
        cvxLocked as bigint * warBalance.value / staker.totalSupply.value / BigInt(1e18),
        cvxAddress
      );
      const total = auraPrice + cvxPrice;
      setTvl(formatNumber(total.toFixed(0).toString()) + '$');
    }

    useEffect(() => {
      computeTVL();
    }, [cvxLocked, auraLocked, warBalance]);

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
          {...textProps}
        >
          {tvl}
        </Text>
      </VStack>
    );
  };

  return (
    <Container mx={'4em'} borderRadius={'1.5em'}>
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
