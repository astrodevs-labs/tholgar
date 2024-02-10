import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import useSWR from 'swr';
import useParaswapPrices from './useParaswapPrice';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export default function useParaswapConversionRate(tokens: {
  amount: bigint;
  srcToken: string;
  destToken: string;
  srcDecimals?: number;
  destDecimals?: number;
}): bigint | undefined {
  const { data, error, isLoading } = useParaswapPrices(tokens);

  if (isLoading) return undefined;
  if (error) return undefined;
  if (!data) return undefined;
  return BigInt(data.priceRoute.destAmount);
}
