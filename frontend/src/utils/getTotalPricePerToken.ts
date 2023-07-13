import axios from 'axios';

const getLlamaPrice = async (tokenAddress: string): Promise<number> => {
  const res = await axios.get(`https://coins.llama.fi/prices/current/ethereum:${tokenAddress}`);
  return res.data.coins[`ethereum:${tokenAddress}`].price;
};

const getCoingeckoPrice = async (tokenAddress: string): Promise<number> => {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`
  );
  return res.data[tokenAddress].usd;
};

const getTotalPricePerToken = async (
  tokenAmount: bigint,
  tokenAddress: string
): Promise<number> => {
  tokenAddress = tokenAddress.toLowerCase();
  const tokenPrice = await getLlamaPrice(tokenAddress).catch(() =>
    getCoingeckoPrice(tokenAddress).catch(() => 0)
  );
  return tokenPrice * Number(tokenAmount);
};

export default getTotalPricePerToken;
