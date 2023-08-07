import React, { FC, useEffect } from 'react';
import { Text, VStack, GridItem, Grid, useColorModeValue, useColorMode, Spinner } from '@chakra-ui/react';
import { Container } from 'components/ui/Container';
import { useBalance, useContractRead, useToken } from 'wagmi';
import formatNumber from 'utils/formatNumber';
import {
  stakerAddress,
  vaultAddress,
  auraAddress,
  cvxAddress,
  warAddress,
  cvxCrvAddress,
  wethAddress,
  warCvxLocker,
  warLockerAbi,
  warAuraLocker,
  redeemerAddress,
  warRedeemerABI,
  ratioAddress,
  warRatioABI,
  palAddress,
  cvxLockerAddress,
  cvxLockerAbi
} from 'config/blockchain';
import getTotalPricePerToken from 'utils/getTotalPricePerToken';
import axios from 'axios';
import { useFetchRewardStates } from 'hooks/useFetchRewardStates';

export interface StatsDisplayProps {}

export const StatsDisplay: FC<StatsDisplayProps> = () => {
  const {
    data: warBalance,
  } = useBalance({
    address: vaultAddress,
    token: stakerAddress
  });
  const { data: totalWarLocked } = useBalance({
    address: stakerAddress,
    token: warAddress
  });
  const { data: cvxLocked } = useContractRead({
    address: warCvxLocker,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens'
  });
  const { data: auraLocked } = useContractRead({
    address: warAuraLocker,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens'
  });
  const { data: weights } = useContractRead({
    address: redeemerAddress,
    abi: warRedeemerABI,
    functionName: 'getTokenWeights'
  });
  const { data: staker } = useToken({
    address: stakerAddress
  });

  const textProps =
    useColorMode().colorMode === 'light'
      ? { color: 'brand.primary.300' }
      : { bgGradient: 'linear(to-r, brand.primary.300, white)' };
  const infoColor = useColorModeValue('black', 'white');

  const CirculatingSupply: FC = () => {
    const { data: vault } = useToken({
      address: vaultAddress
    });

    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'Circulating Supply'}
        </Text>
        {
          vault === undefined ? (
            <Spinner />
          ) : (
            <Text
              whiteSpace={'nowrap'}
              fontSize={'1.5em'}
              fontWeight={'bold'}
              bgClip="text"
              {...textProps}
            >
              {formatNumber(vault!.totalSupply.formatted)}
            </Text>
          )
        }
      </VStack>
    );
  };

  const APY: FC = () => {
    const [apy, setApy] = React.useState<string | undefined>(undefined);

    const warRates = useFetchRewardStates(warAddress);
    const wethRates = useFetchRewardStates(wethAddress);
    const palRates = useFetchRewardStates(palAddress);
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
    const { data: rewardData } = useContractRead({
      address: cvxLockerAddress,
      abi: cvxLockerAbi,
      functionName: 'rewardData',
      args: [cvxCrvAddress]
    });
    const { data: lockedSupply } = useContractRead({
      address: cvxLockerAddress,
      abi: cvxLockerAbi,
      functionName: 'lockedSupply'
    });

    async function computeActiveTvl(): Promise<number | undefined> {
      if (totalWarLocked === undefined || weights == undefined) return;

      const auraWeight = (weights as any).find(
        (weight: any) => weight.token === auraAddress
      ).weight;
      const cvxWeight = (weights as any).find((weight: any) => weight.token === cvxAddress).weight;

      if (auraWeight === undefined || cvxWeight === undefined) return;

      const auraAmount = (totalWarLocked.value * auraWeight) / (auraRatio as bigint) / BigInt(1e18);
      const cvxAmount = (totalWarLocked.value * cvxWeight) / (cvxRatio as bigint) / BigInt(1e18);

      const warlordTVL =
        (await getTotalPricePerToken(auraAmount, auraAddress)) +
        (await getTotalPricePerToken(cvxAmount, cvxAddress));
      return warlordTVL;
    }

    async function computeCrvCvxApr(tvl: number): Promise<number | undefined> {
      if (rewardData === undefined || lockedSupply === undefined) return;

      const cvxCrvAmount =
        ((rewardData as any)[2] * 604800n * 4n * 12n * (cvxLocked as bigint)) /
        (lockedSupply as bigint) /
        BigInt(1e18);
      const cvxCrvDollar = await getTotalPricePerToken(cvxCrvAmount, cvxCrvAddress);
      const cvxCrvApr = cvxCrvDollar / tvl;
      return cvxCrvApr;
    }

    async function computeAuraBalApr(): Promise<number | undefined> {
      if (totalWarLocked === undefined || weights === undefined || auraLocked === undefined) return;
      const response = await axios.post('https://data.aura.finance/graphql', {
        query:
          '{\n  locker {\n    aprs {\n      breakdown {\n        value      },\n    }\n  }\n  \n}\n  \n  '
      });
      let amount = 0;
      for (const apr of response.data.data.locker.aprs.breakdown) {
        amount += apr.value;
      }
      const auraWeight = (weights as any).find(
        (weight: any) => weight.token === auraAddress
      ).weight;
      // TODO clean without number
      return (
        (((amount * (Number(auraWeight) / 1e18)) / 100) * Number(auraLocked as bigint)) /
        Number((totalWarLocked.value * auraWeight) / (auraRatio as bigint))
      );
    }

    async function computeWarApr(tvl: number): Promise<number | undefined> {
      if (warRates === undefined || weights === undefined) return;
      if ((warRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

      const warAmount = (warRates as bigint[])[3] * 604800n * 4n * 12n;

      const auraWeight = (weights as any).find(
        (weight: any) => weight.token === auraAddress
      ).weight;
      const cvxWeight = (weights as any).find((weight: any) => weight.token === cvxAddress).weight;

      const cvxAmount = (warAmount * auraWeight) / (auraRatio as bigint) / BigInt(1e18);
      const auraAmount = (warAmount * cvxWeight) / (cvxRatio as bigint) / BigInt(1e18);

      const cvxDollar = await getTotalPricePerToken(cvxAmount, cvxAddress);
      const auraDollar = await getTotalPricePerToken(auraAmount, auraAddress);

      const warDollar = cvxDollar + auraDollar;
      const warApr = warDollar / tvl;
      return warApr;
    }

    async function computeWethApr(tvl: number): Promise<number | undefined> {
      if (wethRates === undefined) return;
      if ((wethRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

      const wethAmount = (wethRates as bigint[])[3] * 604800n * 4n * 12n;

      const wethDollar = await getTotalPricePerToken(wethAmount / BigInt(1e18), wethAddress);
      const wethApr = wethDollar / tvl;
      return wethApr;
    }

    async function computePalApr(tvl: number): Promise<number | undefined> {
      if (palRates === undefined) return;
      if ((palRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

      const palAmount = (palRates as bigint[])[3] * 604800n * 4n * 12n;

      const palDollar = await getTotalPricePerToken(palAmount / BigInt(1e18), palAddress);
      const palApr = palDollar / tvl;
      return palApr;
    }

    async function computeAPY() {
      const warlordTVL = await computeActiveTvl();
      if (warlordTVL === undefined) return;

      const auraBalApr = await computeAuraBalApr();
      const warApr = await computeWarApr(warlordTVL);
      const wethApr = await computeWethApr(warlordTVL);
      const palApr = await computePalApr(warlordTVL);
      const cvxCrvApr = await computeCrvCvxApr(warlordTVL);
      if (
        auraBalApr === undefined ||
        warApr === undefined ||
        wethApr === undefined ||
        palApr === undefined ||
        cvxCrvApr === undefined
      )
        return;

      const apr = auraBalApr + warApr + wethApr + palApr + cvxCrvApr;
      const apy = (1 + apr / 48) ** 48 - 1;
      setApy((apy * 100).toFixed(2) + '%');
    }

    useEffect(() => {
      computeAPY();
    }, [
      palRates,
      warRates,
      wethRates,
      totalWarLocked,
      weights,
      auraLocked,
      cvxLocked,
      auraRatio,
      cvxRatio
    ]);

    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'vAPY'}
        </Text>
        {
          apy === undefined ? (
            <Spinner />
          ) : (
            <Text
              whiteSpace={'nowrap'}
              fontSize={'1.5em'}
              fontWeight={'bold'}
              bgClip="text"
              {...textProps}
            >
              {apy}
            </Text>
          )
        }
      </VStack>
    );
  };

  const WARLocked: FC = () => {
    return (
      <VStack>
        <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
          {'WAR Locked'}
        </Text>
        {
          warBalance === undefined ? (
            <Spinner />
          ) : (
            <Text
              whiteSpace={'nowrap'}
              fontSize={'1.5em'}
              fontWeight={'bold'}
              bgClip="text"
              {...textProps}
            >
              {formatNumber(warBalance!.formatted)}
            </Text>
          )
        }
      </VStack>
    );
  };

  const TVL: FC = () => {
    const [tvl, setTvl] = React.useState<string | undefined>(undefined);

    async function computeTVL() {
      if (
        cvxLocked === undefined ||
        auraLocked === undefined ||
        warBalance === undefined ||
        staker === undefined
      )
        return;
      const auraPrice = await getTotalPricePerToken(
        ((auraLocked as bigint) * warBalance.value) / staker.totalSupply.value / BigInt(1e18),
        auraAddress
      );
      const cvxPrice = await getTotalPricePerToken(
        ((cvxLocked as bigint) * warBalance.value) / staker.totalSupply.value / BigInt(1e18),
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
        {
          tvl === undefined ? (
            <Spinner />
          ) : (
            <Text
              whiteSpace={'nowrap'}
              fontSize={'1.5em'}
              fontWeight={'bold'}
              bgClip={'text'}
              {...textProps}
            >
              {tvl}
            </Text>
          )
        }
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
