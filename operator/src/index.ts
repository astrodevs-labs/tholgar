import compound from "./utils/compound";
import harvest from "./utils/harvest";
import cron from "node-cron";
import "dotenv/config";

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

  let running = false;
  cron.schedule("0 4 * * 0", async () => {
    if (running) {
      return;
    } else {
      running = true;
    }
    try {
      await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
      running = false;
    } catch (err: any) {
      console.log(`Harvest failed: ${err.message}`);
      retryHarvestTask.start();
      running = false;
    }

    try {
      await compound(vaultAddress, maxGasPrice, slippage);
    } catch (err: any) {
      console.log(`Compound failed: ${err.message}`);
      retryCompoundTask.start();
    }
  });

  let retryHarvestRunning = false;
  const retryHarvestTask = cron.schedule(
    "0 5 * * * *",
    async () => {
      if (retryHarvestRunning) {
        return;
      } else {
        retryHarvestRunning = true;
      }
      try {
        await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
        retryHarvestTask.stop();
        retryHarvestRunning = false;
      } catch (err: any) {
        console.log(`Harvest failed: ${err.message}`);
        retryHarvestRunning = false;
      }
    },
    { scheduled: false }
  );

  let retryCompoundRunning = false;
  const retryCompoundTask = cron.schedule(
    "0 5 * * * *",
    async () => {
      if (retryCompoundRunning) {
        return;
      } else {
        retryCompoundRunning = true;
      }
      try {
        await compound(vaultAddress, maxGasPrice, slippage);
        retryCompoundTask.stop();
        retryCompoundRunning = false;
      } catch (err: any) {
        console.log(`Compound failed: ${err.message}`);
        retryCompoundRunning = false;
      }
    },
    { scheduled: false }
  );
})();
