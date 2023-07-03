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
    if (!priceRoute.data["priceRoute"]) {
      throw new Error("No price route found");
    }

    const priceData: any = await axios.post(
      `${paraswapApiUrl}/transactions/${chainId}?ignoreChecks=true&ignoreGasEstimate=true`,
      {
          srcToken: priceRoute.data["priceRoute"].srcToken,
          destToken: priceRoute.data["priceRoute"].destToken,
          srcAmount: priceRoute.data["priceRoute"].srcAmount,
          destAmount: BigNumber.from(priceRoute.data["priceRoute"].destAmount)
            .sub(
              BigNumber.from(priceRoute.data["priceRoute"].destAmount)
                .div(100)
                .mul(slippage)
            )
            .toString(),
          priceRoute: priceRoute.data["priceRoute"],
          userAddress: userAddress,
          partner: "paraswap.io",
          srcDecimals: priceRoute.data["priceRoute"].srcDecimals,
          destDecimals: priceRoute.data["priceRoute"].destDecimals,
      }
    );
    if (!priceData.data["data"]) {
      throw new Error("No data returned from Paraswap");
    }
    return priceData.data["data"];
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
