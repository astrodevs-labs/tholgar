export default function convertBigintToFormatted(
  number: bigint,
  decimals: number
): string {
  const numberAsString = number.toString();
  const nbDecimals = numberAsString.length - decimals;
  const numberWithoutDecimals = numberAsString.slice(0, nbDecimals);
  const numberWithDecimals = numberWithoutDecimals + '.' + numberAsString.slice(nbDecimals);

  return numberWithDecimals;
}
