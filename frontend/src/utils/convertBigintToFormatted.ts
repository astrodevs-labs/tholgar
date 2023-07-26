import { formatUnits } from "viem";

export default function convertBigintToFormatted(
  value: bigint,
  decimals: number
): string {
  return formatUnits(value ?? '0', decimals)
}
