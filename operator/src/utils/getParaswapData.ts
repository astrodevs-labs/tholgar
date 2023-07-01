import { BigNumber } from "ethers";
import axios from "axios";
import config from "../config/config";

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
  const paraswapApiUrl = config.paraswapApiUrl();
  try {
    const priceRoute: any = await axios.get(
      `${paraswapApiUrl}/prices?srcToken=${srcToken}&destToken=${destToken}&amount=${amount.toString()}&side=SELL&network=${chainId}&srcDecimals=${srcDecimals}&destDecimals=${destDecimals}&userAddress=${userAddress}`
    );
    if (!priceRoute["priceRoute"]) {
      throw new Error("No price route found");
    }

    const priceData: any = await axios.post(
      `${paraswapApiUrl}/transactions/${chainId}?ignoreChecks=true&ignoreGasEstimate=true`,
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
    );
    if (!priceData["data"]) {
      throw new Error("No data returned from Paraswap");
    }
    return priceData["data"];
  } catch (error: any) {
    throw new Error(error.message);
  }
}
