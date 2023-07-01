import compound from "./utils/compound";
import harvest from "./utils/harvest";
import cron from "node-cron";

(async () => {
  if (!process.env.SLIPPAGE) {
    throw new Error("SLIPPAGE is not defined");
  }
  if (!process.env.MAX_GAS_PRICE) {
    throw new Error("MAX_GAS_PRICE is not defined");
  }
  if (!process.env.VAULT_ADDRESS) {
    throw new Error("VAULT_ADDRESS is not defined");
  }
  if (!process.env.STAKER_ADDRESS) {
    throw new Error("STAKER_ADDRESS is not defined");
  }

  const slippage = parseInt(process.env.SLIPPAGE);
  const maxGasPrice = parseFloat(process.env.MAX_GAS_PRICE);
  const vaultAddress = process.env.VAULT_ADDRESS;
  const stakerAddress = process.env.STAKER_ADDRESS;

  let retryCompound = false;
  let retryHarvest = false;

  cron.schedule("0 4 * * 0", async () => {
    try {
      await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
    } catch (err) {
      console.log(`Harvest failed: ${err.message}`);
      retryHarvest = true;
    }

    try {
      await compound(vaultAddress, maxGasPrice, slippage);
    } catch (err) {
      console.log(`Compound failed: ${err.message}`);
      retryCompound = true;
    }
  });

  cron.schedule("0 5 * * * *", async () => {
    if (retryHarvest) {
      try {
        await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
        retryHarvest = false;
      } catch (err) {
        console.log(`Harvest failed: ${err.message}`);
      }
    }
  });
  cron.schedule("0 5 * * * *", async () => {
    if (retryCompound) {
      try {
        await compound(vaultAddress, maxGasPrice, slippage);
        retryCompound = false;
      } catch (err) {
        console.log(`Compound failed: ${err.message}`);
      }
    }
  });
})();
