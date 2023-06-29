import { BigNumber } from "ethers";
import ky from "ky";

export default async function getParaswapData(
  srcToken: string,
  srcDecimals: string,
  destToken: string,
  destDecimals: string,
  amount: BigNumber,
  userAddress: string,
  chainId: number,
  slippage: number
): Promise<string> {
  try {
    const priceRoute: any = await ky
      .get(
        `https://apiv5.paraswap.io/prices?srcToken=${srcToken}&destToken=${destToken}&amount=${amount.toString()}&side=SELL&network=${chainId}&srcDecimals=${srcDecimals}&destDecimals=${destDecimals}&userAddress=${userAddress}`
      )
      .json();
    if (!priceRoute["priceRoute"]) {
      throw new Error("No price route found");
    }

    const priceData: any = await ky
      .post(
        `https://apiv5.paraswap.io/transactions/${chainId}?ignoreChecks=true&ignoreGasEstimate=true`,
        {
          json: {
            srcToken: priceRoute["priceRoute"].srcToken,
            destToken: priceRoute["priceRoute"].destToken,
            srcAmount: priceRoute["priceRoute"].srcAmount,
            destAmount: BigNumber.from(priceRoute["priceRoute"].destAmount)
              .sub(
                BigNumber.from(priceRoute["priceRoute"].destAmount)
                  .div(100)
                  .mul(slippage)
              )
              .toString(),
            priceRoute: priceRoute["priceRoute"],
            userAddress: userAddress,
            partner: "paraswap.io",
            srcDecimals: priceRoute["priceRoute"].srcDecimals,
            destDecimals: priceRoute["priceRoute"].destDecimals,
          },
        }
      )
      .json();
    if (!priceData["data"]) {
      throw new Error("No data returned from Paraswap");
    }
    return priceData["data"];
  } catch (error) {
    throw new Error(error.message);
  }
}
