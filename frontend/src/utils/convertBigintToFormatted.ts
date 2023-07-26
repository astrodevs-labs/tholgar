export default function convertBigintToFormatted(
  number: bigint,
  decimals: number
): string {
  const numberAsString = number.toString();
  const nbDecimals = numberAsString.length - decimals;
  const numberWithoutDecimals = numberAsString.slice(0, nbDecimals);
  let numberWithDecimals = numberWithoutDecimals + '.' + numberAsString.slice(nbDecimals);

  for (let i = 0; i < decimals; i++) {
    if (numberWithDecimals[numberWithDecimals.length - 1] === '0') {
      numberWithDecimals = numberWithDecimals.slice(0, -1);
    } else {
      break;
    }
  }

  if (numberWithDecimals[numberWithDecimals.length - 1] === '.') {
    numberWithDecimals = numberWithDecimals.slice(0, -1);
  }

  return numberWithDecimals;
}
