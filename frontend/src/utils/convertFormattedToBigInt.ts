export default function convertFormattedToBigInt(
  formattedNumber: string,
  decimals: number
): bigint {
  const nbDecimals = formattedNumber.split('.')[1]?.length || 0;
  const nbDecimalsToAdd = decimals - nbDecimals;
  const numberWithoutDecimals = formattedNumber.replace('.', '');
  const numberWithDecimals = numberWithoutDecimals + '0'.repeat(nbDecimalsToAdd);

  return BigInt(numberWithDecimals);
}
