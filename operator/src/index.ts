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

  cron.schedule("0 4 * * 0", async () => {
    try {
      await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
    } catch (err) {
      console.log(`Harvest failed: ${err.message}`);
      retryHarvestTask.start();
    }

    try {
      await compound(vaultAddress, maxGasPrice, slippage);
    } catch (err) {
      console.log(`Compound failed: ${err.message}`);
      retryCompoundTask.start();
    }
  });

  const retryHarvestTask = cron.schedule(
    "0 5 * * * *",
    async () => {
      try {
        await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
        retryHarvestTask.stop();
      } catch (err) {
        console.log(`Harvest failed: ${err.message}`);
      }
    },
    { scheduled: false }
  );
  const retryCompoundTask = cron.schedule(
    "0 5 * * * *",
    async () => {
      try {
        await compound(vaultAddress, maxGasPrice, slippage);
        retryCompoundTask.stop();
      } catch (err) {
        console.log(`Compound failed: ${err.message}`);
      }
    },
    { scheduled: false }
  );
})();
