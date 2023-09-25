/* eslint-disable no-unused-vars */

import React, { FC, useEffect } from 'react';
import { Text, VStack, Spinner, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { useBalance, useContractRead, useToken } from 'wagmi';
import { FetchBalanceResult, FetchTokenResult } from '@wagmi/core';
import {
  auraAddress,
  cvxAddress,
  cvxCrvAddress,
  cvxLockerAbi,
  cvxLockerAddress,
  palAddress,
  redeemerAddress,
  stakerAddress,
  warAddress,
  warAuraLocker,
  warCvxLocker,
  warLockerAbi,
  warRedeemerABI,
  wethAddress
} from 'config/blockchain';
import { useStore } from 'store';
import { useFetchRewardStates } from 'hooks/useFetchRewardStates';
import usePostRequest from 'hooks/usePostRequest';
import getTotalPricePerToken from 'utils/getTotalPricePerToken';

async function computeActiveTvl(
  totalWarLocked: FetchBalanceResult | undefined,
  warSupply: FetchTokenResult | undefined,
  auraLocked: bigint | undefined,
  cvxLocked: bigint | undefined,
  auraQueued: bigint | undefined,
  cvxQueued: bigint | undefined
): Promise<number | undefined> {
  if (
    totalWarLocked === undefined ||
    auraLocked == undefined ||
    cvxLocked == undefined ||
    warSupply == undefined ||
    auraQueued == undefined ||
    cvxQueued == undefined
  )
    return;

  const auraAmount =
    Number(((auraLocked - auraQueued) * totalWarLocked.value) / (warSupply.totalSupply.value * BigInt(1e15))) /
    1000;
  const cvxAmount =
    Number(((cvxLocked - cvxQueued) * totalWarLocked.value) / (warSupply.totalSupply.value * BigInt(1e15))) /
    1000;

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
      ((rewardData as any)[2] * 86400n * 365n * (cvxLocked as bigint)) /
        (lockedSupply as bigint) /
        BigInt(1e15)
    ) / 1000;
  const cvxCrvDollar = await getTotalPricePerToken(cvxCrvAmount, cvxCrvAddress);
  const cvxCrvApr = cvxCrvDollar / tvl;
  return cvxCrvApr;
}

async function computeAuraBalApr(
  totalWarLocked: FetchBalanceResult | undefined,
  warSupply: FetchTokenResult | undefined,
  auraLocked: bigint | undefined,
  cvxLocked: bigint | undefined,
  breakdownResponse: any
): Promise<number | undefined> {
  if (
    totalWarLocked === undefined ||
    auraLocked === undefined ||
    cvxLocked === undefined ||
    warSupply === undefined ||
    !breakdownResponse
  )
    return;

  let amount = 0;
  for (const apr of breakdownResponse.data.data.locker.aprs.breakdown) {
    amount += apr.value;
  }
  return (
    (amount *
      ((Number(auraLocked) / Number(cvxLocked) / 10) *
        (Number(warSupply.totalSupply.value) / Number(totalWarLocked.value)))) /
    100
  );
}

async function computeWarApr(
  warRates: bigint[] | undefined,
  auraLocked: bigint | undefined,
  cvxLocked: bigint | undefined,
  auraQueued: bigint | undefined,
  cvxQueued: bigint | undefined,
  warSupply: FetchTokenResult | undefined,
  tvl: number
): Promise<number | undefined> {
  if (
    warRates === undefined ||
    auraLocked === undefined ||
    cvxLocked === undefined ||
    warSupply === undefined ||
    auraQueued === undefined ||
    cvxQueued === undefined
  )
    return;
  if ((warRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

  const warAmount = (warRates as bigint[])[3] * 86400n * 365n;

  const cvxAmount =
    Number(((cvxLocked - cvxQueued) * warAmount) / warSupply.totalSupply.value / BigInt(1e15)) / 1000;
  const auraAmount =
    Number(((auraLocked - auraQueued) * warAmount) / warSupply.totalSupply.value / BigInt(1e15)) / 1000;

  const cvxDollar = await getTotalPricePerToken(cvxAmount, cvxAddress);
  const auraDollar = await getTotalPricePerToken(auraAmount, auraAddress);

  const warDollar = cvxDollar + auraDollar;
  const warApr = warDollar / tvl;

  return warApr;
}

async function computeWethApr(wethRates: any, tvl: number): Promise<number | undefined> {
  if (wethRates === undefined) return;
  if ((wethRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

  const wethAmount = (wethRates as bigint[])[3] * 86400n * 365n;

  const wethDollar = await getTotalPricePerToken(
    Number(wethAmount / BigInt(1e15)) / 1000,
    wethAddress
  );

  const wethApr = wethDollar / tvl;
  return wethApr;
}

async function computePalApr(palRates: any, tvl: number): Promise<number | undefined> {
  if (palRates === undefined) return;
  if ((palRates as bigint[])[2] * 1000n <= new Date().valueOf()) return 0;

  const palAmount = (palRates as bigint[])[3] * 86400n * 365n;

  const palDollar = await getTotalPricePerToken(
    Number(palAmount / BigInt(1e15)) / 1000,
    palAddress
  );
  const palApr = palDollar / tvl;
  return palApr;
}

async function computeAPY(
  totalWarLocked: FetchBalanceResult | undefined,
  totalSupply: FetchTokenResult | undefined,
  auraLocked: any,
  breakdownResponse: any,
  warRates: any,
  wethRates: any,
  palRates: any,
  rewardData: any,
  lockedSupply: any,
  cvxLocked: any,
  auraQueued: any,
  cvxQueued: any,
): Promise<string> {
  const warlordTVL = await computeActiveTvl(totalWarLocked, totalSupply, auraLocked, cvxLocked, auraQueued, cvxQueued);
  if (warlordTVL === undefined) throw new Error('warlordTVL is undefined');

  const auraBalApr = await computeAuraBalApr(
    totalWarLocked,
    totalSupply,
    auraLocked,
    cvxLocked,
    breakdownResponse
  );
  const warApr = await computeWarApr(warRates, auraLocked, cvxLocked, auraQueued, cvxQueued, totalSupply, warlordTVL);
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
  const { data: totalSupply } = useToken({
    address: !apy ? warAddress : undefined
  });
  const { data: auraQueued } = useContractRead({
    address: !apy ? redeemerAddress : undefined,
    abi: warRedeemerABI,
    functionName: 'queuedForWithdrawal',
    args: [auraAddress]
  });
  const { data: cvxQueued } = useContractRead({
    address: !apy ? redeemerAddress : undefined,
    abi: warRedeemerABI,
    functionName: 'queuedForWithdrawal',
    args: [cvxAddress]
  });
  const breakdownResponse = usePostRequest('https://data.aura.finance/graphql', {
    query:
      '{\n  locker {\n    aprs {\n      breakdown {\n        value      },\n    }\n  }\n  \n}\n  \n  '
  });

  useEffect(() => {
    if (apy === undefined)
      computeAPY(
        totalWarLocked,
        totalSupply,
        auraLocked,
        breakdownResponse,
        warRates,
        wethRates,
        palRates,
        rewardData,
        lockedSupply,
        cvxLocked,
        auraQueued,
        cvxQueued
      )
        .then(setApy)
        .catch(() => {});
  }, [
    palRates,
    warRates,
    wethRates,
    totalWarLocked,
    breakdownResponse,
    auraLocked,
    cvxLocked,
    totalSupply,
    auraQueued,
    cvxQueued,
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
