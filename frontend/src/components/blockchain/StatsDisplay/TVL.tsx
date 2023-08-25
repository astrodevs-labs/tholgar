/* eslint-disable no-unused-vars */

import React, { FC, useEffect } from 'react';
import { Text, VStack, Spinner, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { useBalance, useContractRead, useToken } from 'wagmi';
import {
  auraAddress,
  cvxAddress,
  stakerAddress,
  vaultAddress,
  warAuraLocker,
  warCvxLocker,
  warLockerAbi
} from 'config/blockchain';
import formatNumber from 'utils/formatNumber';
import { useStore } from 'store';
import getTotalPricePerToken from '../../../utils/getTotalPricePerToken';

export interface TVLProps {}

export const TVL: FC<TVLProps> = () => {
  const [tvl, setTvl] = useStore((state) => [state.tvl, state.setTvl]);
  const { data: cvxLocked } = useContractRead({
    address: !tvl ? warCvxLocker : undefined,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens'
  });
  const { data: auraLocked } = useContractRead({
    address: !tvl ? warAuraLocker : undefined,
    abi: warLockerAbi,
    functionName: 'getCurrentLockedTokens'
  });
  const { data: warBalance } = useBalance({
    address: !tvl ? vaultAddress : undefined,
    token: stakerAddress
  });
  const { data: staker } = useToken({
    address: !tvl ? stakerAddress : undefined
  });

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
    if (tvl === undefined) computeTVL();
  }, [cvxLocked, auraLocked, warBalance]);

  const textProps =
    useColorMode().colorMode === 'light'
      ? { color: 'brand.primary.300' }
      : { bgGradient: 'linear(to-r, brand.primary.300, white)' };
  const infoColor = useColorModeValue('black', 'white');

  return (
    <VStack>
      <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
        {'Total Volume Locked'}
      </Text>
      {tvl === undefined ? (
        <Spinner />
      ) : (
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip={'text'}
          {...textProps}>
          {tvl}
        </Text>
      )}
    </VStack>
  );
};

TVL.defaultProps = {};
