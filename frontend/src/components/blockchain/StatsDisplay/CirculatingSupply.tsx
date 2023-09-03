/* eslint-disable no-unused-vars */

import React, { FC, useEffect } from 'react';
import { Text, VStack, Spinner, useColorModeValue, useColorMode } from '@chakra-ui/react';
import formatNumber from 'utils/formatNumber';
import { useStore } from 'store';
import useOrFetchTokenInfos from '../../../hooks/useOrFetchTokenInfos';
import convertBigintToFormatted from '../../../utils/convertBigintToFormatted';

export interface CirculatingSupplyProps {}

export const CirculatingSupply: FC<CirculatingSupplyProps> = () => {
  const [circulatingSupply, setCirculatingSupply] = useStore((state) => [
    state.circulatingSupply,
    state.setCirculatingSupply
  ]);
  const infos = useOrFetchTokenInfos({ token: 'tWAR' });

  useEffect(() => {
    if (
      infos?.totalSupply !== undefined &&
      infos?.decimals !== undefined &&
      (circulatingSupply === undefined ||
        circulatingSupply !==
          formatNumber(convertBigintToFormatted(infos.totalSupply, infos.decimals)))
    ) {
      setCirculatingSupply(
        formatNumber(convertBigintToFormatted(infos.totalSupply, infos.decimals))
      );
    }
  }, [circulatingSupply, infos, setCirculatingSupply]);

  const textProps =
    useColorMode().colorMode === 'light'
      ? { color: 'brand.primary.300' }
      : { bgGradient: 'linear(to-r, brand.primary.300, white)' };
  const infoColor = useColorModeValue('black', 'white');

  return (
    <VStack>
      <Text whiteSpace={'nowrap'} fontSize={'1.125em'} color={infoColor} opacity={'.7'}>
        {'Circulating Supply'}
      </Text>
      {circulatingSupply === undefined ? (
        <Spinner />
      ) : (
        <Text
          whiteSpace={'nowrap'}
          fontSize={'1.5em'}
          fontWeight={'bold'}
          bgClip="text"
          {...textProps}>
          {circulatingSupply}
        </Text>
      )}
    </VStack>
  );
};

CirculatingSupply.defaultProps = {};
