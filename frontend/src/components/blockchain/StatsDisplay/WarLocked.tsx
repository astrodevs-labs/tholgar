/* eslint-disable no-unused-vars */

import React, { FC, useEffect } from 'react';
import { Text, VStack, Spinner, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { useBalance } from 'wagmi';
import { stakerAddress, vaultAddress } from 'config/blockchain';
import formatNumber from 'utils/formatNumber';
import { useStore } from 'store';

export interface WarLockedProps {}

export const WarLocked: FC<WarLockedProps> = () => {
  const [warLocked, setWarLocked] = useStore((state) => [state.warLocked, state.setWarLocked]);
  const { data: warBalance } = useBalance({
    address: !warLocked ? vaultAddress : undefined,
    token: stakerAddress
  });

  useEffect(() => {
    if (warLocked === undefined && warBalance !== undefined)
      setWarLocked(formatNumber(warBalance!.formatted));
  }, [warLocked, warBalance, setWarLocked]);

  const textProps =
    useColorMode().colorMode === 'light'
      ? { color: 'brand.primary.300' }
      : { bgGradient: 'linear(to-r, brand.primary.300, white)' };
  const infoColor = useColorModeValue('black', 'white');

  return (
    <VStack>
      <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
        {'WAR Locked'}
      </Text>
      {warLocked === undefined ? (
        <Spinner />
      ) : (
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip="text"
          {...textProps}>
          {warLocked}
        </Text>
      )}
    </VStack>
  );
};

WarLocked.defaultProps = {};
