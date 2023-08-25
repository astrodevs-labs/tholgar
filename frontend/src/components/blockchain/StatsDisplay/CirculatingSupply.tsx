/* eslint-disable no-unused-vars */

import React, {FC, useEffect} from 'react';
import {
  Text,
  VStack,
  Spinner,
  useColorModeValue,
  useColorMode
} from '@chakra-ui/react';
import {useToken} from "wagmi";
import { vaultAddress } from 'config/blockchain';
import formatNumber from "utils/formatNumber";
import {useStore} from "store";

export interface CirculatingSupplyProps {}

export const CirculatingSupply: FC<CirculatingSupplyProps> = () => {
  const [circulatingSupply, setCirculatingSupply] = useStore((state) => [state.circulatingSupply, state.setCirculatingSupply]);
  const { data: vault } = useToken({
    address:  circulatingSupply === undefined ? vaultAddress : undefined
  });

  useEffect(() => {
    if (circulatingSupply === undefined && vault !== undefined) {
      setCirculatingSupply(formatNumber(vault!.totalSupply.formatted));
    }
  }, [circulatingSupply, vault, setCirculatingSupply]);



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
