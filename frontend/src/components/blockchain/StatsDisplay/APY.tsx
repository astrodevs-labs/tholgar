/* eslint-disable no-unused-vars */

import React, { FC, useEffect } from 'react';
import { Text, VStack, Spinner, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { useBalance, useContractRead } from 'wagmi';
import { FetchBalanceResult } from '@wagmi/core';
import {
  auraAddress,
  cvxAddress,
  cvxCrvAddress,
  cvxLockerAbi,
  cvxLockerAddress,
  palAddress,
  ratioAddress,
  redeemerAddress,
  stakerAddress,
  warAddress,
  warAuraLocker,
  warCvxLocker,
  warLockerAbi,
  warRatioABI,
  warRedeemerABI,
  wethAddress
} from 'config/blockchain';
import { useStore } from 'store';
import { useFetchRewardStates } from 'hooks/useFetchRewardStates';
import usePostRequest from 'hooks/usePostRequest';
import getTotalPricePerToken from 'utils/getTotalPricePerToken';

async function computeActiveTvl(
  totalWarLocked: FetchBalanceResult | undefined,
  auraRatio: bigint,
  cvxRatio: bigint,
  weights: any[]
): Promise<number | undefined> {
  if (totalWarLocked === undefined || weights == undefined) return;

  const auraWeight = (weights as any).find((weight: any) => weight.token === auraAddress).weight;
  const cvxWeight = (weights as any).find((weight: any) => weight.token === cvxAddress).weight;

  if (auraWeight === undefined || cvxWeight === undefined) return;

  const auraAmount =
    Number(((totalWarLocked.value as bigint) * auraWeight) / (auraRatio as bigint) / BigInt(1e16)) /
    100;
  const cvxAmount =
    Number((totalWarLocked.value * cvxWeight) / (cvxRatio as bigint) / BigInt(1e16)) / 100;

  const warlordTVL =
    (await getTotalPricePerToken(auraAmount, auraAddress)) +
    (await getTotalPricePerToken(cvxAmount, cvxAddress));
  return warlordTVL;
}

async function computeCrvCvxApr(
  rewardData: any,
  lockedSupply: any,
  cvxLocked: any,
  tvl: number
): Promise<number | undefined> {
  if (rewardData === undefined || lockedSupply === undefined) return;

  const cvxCrvAmount =
    Number(
      ((rewardData as any)[2] * 604800n * 4n * 12n * (cvxLocked as bigint)) /
        (lockedSupply as bigint) /
        BigInt(1e16)
    ) / 100;
  const cvxCrvDollar = await getTotalPricePerToken(cvxCrvAmount, cvxCrvAddress);
  const cvxCrvApr = cvxCrvDollar / tvl;
  return cvxCrvApr;
}

async function computeAuraBalApr(
  totalWarLocked: FetchBalanceResult | undefined,
  weights: any[],
  auraLocked: any,
  breakdownResponse: any,
  auraRatio: any
): Promise<number | undefined> {
  if (
    totalWarLocked === undefined ||
    weights === undefined ||
    auraLocked === undefined ||
    !breakdownResponse
  )
    return;

  let amount = 0;
  for (const apr of breakdownResponse.data.data.locker.aprs.breakdown) {
    amount += apr.value;
  }
  const auraWeight = (weights as any).find((weight: any) => weight.token === auraAddress).weight;
  // TODO clean without number
  return (
    (((amount * (Number(auraWeight) / 1e18)) / 100) * Number(auraLocked as bigint)) /
    Number((totalWarLocked.value * auraWeight) / (auraRatio as bigint))
  );
}

async function computeWarApr(
  warRates: bigint[] | undefined,
  weights: any[],
  auraRatio: any,
  cvxRatio: any,
  tvl: number
): Promise<number | undefined> {
  if (warRates === undefined || weights === undefined) return;
  if ((warRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

  const warAmount = (warRates as bigint[])[3] * 604800n * 4n * 12n;

  const auraWeight = (weights as any).find((weight: any) => weight.token === auraAddress).weight;
  const cvxWeight = (weights as any).find((weight: any) => weight.token === cvxAddress).weight;

  const cvxAmount = Number((warAmount * auraWeight) / (auraRatio as bigint) / BigInt(1e16)) / 100;
  const auraAmount = Number((warAmount * cvxWeight) / (cvxRatio as bigint) / BigInt(1e16)) / 100;

  const cvxDollar = await getTotalPricePerToken(cvxAmount, cvxAddress);
  const auraDollar = await getTotalPricePerToken(auraAmount, auraAddress);

  const warDollar = cvxDollar + auraDollar;
  const warApr = warDollar / tvl;
  return warApr;
}

async function computeWethApr(wethRates: any, tvl: number): Promise<number | undefined> {
  if (wethRates === undefined) return;
  if ((wethRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

  const wethAmount = (wethRates as bigint[])[3] * 604800n * 4n * 12n;

  const wethDollar = await getTotalPricePerToken(
    Number(wethAmount / BigInt(1e16)) / 100,
    wethAddress
  );
  const wethApr = wethDollar / tvl;
  return wethApr;
}

async function computePalApr(palRates: any, tvl: number): Promise<number | undefined> {
  if (palRates === undefined) return;
  if ((palRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

  const palAmount = (palRates as bigint[])[3] * 604800n * 4n * 12n;

  const palDollar = await getTotalPricePerToken(Number(palAmount / BigInt(1e16)) / 100, palAddress);
  const palApr = palDollar / tvl;
  return palApr;
}

async function computeAPY(
  totalWarLocked: FetchBalanceResult | undefined,
  auraRatio: any,
  cvxRatio: any,
  weights: unknown,
  auraLocked: any,
  breakdownResponse: any,
  warRates: any,
  wethRates: any,
  palRates: any,
  rewardData: any,
  lockedSupply: any,
  cvxLocked: any
): Promise<string> {
  const warlordTVL = await computeActiveTvl(
    totalWarLocked,
    auraRatio as bigint,
    cvxRatio as bigint,
    weights as any[]
  );
  if (warlordTVL === undefined) throw new Error('warlordTVL is undefined');

  const auraBalApr = await computeAuraBalApr(
    totalWarLocked,
    weights as any[],
    auraLocked,
    breakdownResponse,
    auraRatio
  );
  const warApr = await computeWarApr(warRates, weights as any[], auraRatio, cvxRatio, warlordTVL);
  const wethApr = await computeWethApr(wethRates, warlordTVL);
  const palApr = await computePalApr(palRates, warlordTVL);
  const cvxCrvApr = await computeCrvCvxApr(rewardData, lockedSupply, cvxLocked, warlordTVL);

  if (
    auraBalApr === undefined ||
    warApr === undefined ||
    wethApr === undefined ||
    palApr === undefined ||
    cvxCrvApr === undefined
  )
    throw new Error('APR is undefined');

  const apr = auraBalApr + warApr + wethApr + palApr + cvxCrvApr;
  const apy = (1 + apr / 48) ** 48 - 1;
  const apyString = (apy * 100).toFixed(2) + '%';

  return apyString;
}

export interface APYProps {}

export const APY: FC<APYProps> = () => {
  const [apy, setApy] = useStore((state) => [state.apy, state.setApy]);

  const warRates = useFetchRewardStates(warAddress, !apy);
  const wethRates = useFetchRewardStates(wethAddress, !apy);
  const palRates = useFetchRewardStates(palAddress, !apy);
  const { data: auraRatio } = useContractRead({
    address: !apy ? ratioAddress : undefined,
    abi: warRatioABI,
    functionName: 'getTokenRatio',
    args: [auraAddress]
  });
  const { data: cvxRatio } = useContractRead({
    address: !apy ? ratioAddress : undefined,
    abi: warRatioABI,
    functionName: 'getTokenRatio',
    args: [cvxAddress]
  });
  const { data: rewardData } = useContractRead({
    address: !apy ? cvxLockerAddress : undefined,
    abi: cvxLockerAbi,
    functionName: 'rewardData',
    args: [cvxCrvAddress]
  });
  const { data: lockedSupply } = useContractRead({
    address: !apy ? cvxLockerAddress : undefined,
    abi: cvxLockerAbi,
    functionName: 'lockedSupply'
  });
  const { data: totalWarLocked } = useBalance({
    address: !apy ? stakerAddress : undefined,
    token: warAddress
  });
  const { data: cvxLocked } = useContractRead({
    address: !apy ? warCvxLocker : undefined,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens'
  });
  const { data: auraLocked } = useContractRead({
    address: !apy ? warAuraLocker : undefined,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens'
  });
  const { data: weights } = useContractRead({
    address: !apy ? redeemerAddress : undefined,
    abi: warRedeemerABI,
    functionName: 'getTokenWeights'
  });
  const breakdownResponse = usePostRequest('https://data.aura.finance/graphql', {
    query:
      '{\n  locker {\n    aprs {\n      breakdown {\n        value      },\n    }\n  }\n  \n}\n  \n  '
  });

  useEffect(() => {
    if (apy === undefined)
      computeAPY(
        totalWarLocked,
        auraRatio,
        cvxRatio,
        weights,
        auraLocked,
        breakdownResponse,
        warRates,
        wethRates,
        palRates,
        rewardData,
        lockedSupply,
        cvxLocked
      )
        .then(setApy)
        .catch(() => {});
  }, [
    palRates,
    warRates,
    wethRates,
    totalWarLocked,
    breakdownResponse,
    weights,
    auraLocked,
    cvxLocked,
    auraRatio,
    cvxRatio
  ]);

  const textProps =
    useColorMode().colorMode === 'light'
      ? { color: 'brand.primary.300' }
      : { bgGradient: 'linear(to-r, brand.primary.300, white)' };
  const infoColor = useColorModeValue('black', 'white');

  return (
    <VStack>
      <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
        {'vAPY'}
      </Text>
      {apy === undefined ? (
        <Spinner />
      ) : (
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip="text"
          {...textProps}>
          {apy}
        </Text>
      )}
    </VStack>
  );
};

APY.defaultProps = {};
