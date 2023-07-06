import compound from "./utils/compound";
import harvest from "./utils/harvest";
import cron from "node-cron";
import config from "./config/config";

function mainJob(
  vaultAddress: string,
  stakerAddress: string,
  maxGasPrice: number,
  slippage: number,
  retryCompoundTask: cron.ScheduledTask,
  retryHarvestTask: cron.ScheduledTask
) {
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
}

function retryHarvestJob(
  vaultAddress: string,
  stakerAddress: string,
  maxGasPrice: number,
  slippage: number
): cron.ScheduledTask {
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
  return retryHarvestTask;
}

function retryCompoundJob(
  vaultAddress: string,
  maxGasPrice: number,
  slippage: number
): cron.ScheduledTask {
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
  return retryCompoundTask;
}

(async () => {
  let vaultAddress = config.vaultAddress();
  let stakerAddress = config.stakerAddress();
  let maxGasPrice = config.maxGasPrice();
  let slippage = config.slippage();

  const retryCompoundTask = retryCompoundJob(
    vaultAddress,
    maxGasPrice,
    slippage
  );
  const retryHarvestTask = retryHarvestJob(
    vaultAddress,
    stakerAddress,
    maxGasPrice,
    slippage
  );

  mainJob(
    vaultAddress,
    stakerAddress,
    maxGasPrice,
    slippage,
    retryCompoundTask,
    retryHarvestTask
  );
})();
