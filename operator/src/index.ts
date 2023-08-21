import compound from "./utils/compound";
import harvest from "./utils/harvest";
import cron from "node-cron";
import config from "./config/config";
import { BigNumber } from "ethers";

function mainJob(
  vaultAddress: string,
  stakerAddress: string,
  maxGasPrice: number,
  slippage: number,
  tokensToHarvest: string[],
  ratios: Map<string, BigNumber>,
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
      await harvest(
        vaultAddress,
        stakerAddress,
        maxGasPrice,
        slippage,
        tokensToHarvest
      );
      running = false;
    } catch (err: any) {
      console.log(`Harvest failed: ${err.message}`);
      retryHarvestTask.start();
      running = false;
    }

    try {
      await compound(vaultAddress, maxGasPrice, slippage, ratios);
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
  slippage: number,
  tokensToHarvest: string[]
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
        await harvest(
          vaultAddress,
          stakerAddress,
          maxGasPrice,
          slippage,
          tokensToHarvest
        );
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
  slippage: number,
  ratios: Map<string, BigNumber>
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
        await compound(vaultAddress, maxGasPrice, slippage, ratios);
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
  let tokensToHarvest = config.tokensToHarvest();
  let ratios = config.ratios();
  let harvestEnabled = config.harvest();
  let compoundEnabled = config.compound();

  if (harvestEnabled) {
    await harvest(
      vaultAddress,
      stakerAddress,
      maxGasPrice,
      slippage,
      tokensToHarvest,
      false
    );
    return;
  }
  if (compoundEnabled) {
    await compound(vaultAddress, maxGasPrice, slippage, ratios, false);
    return;
  }

  const retryCompoundTask = retryCompoundJob(
    vaultAddress,
    maxGasPrice,
    slippage,
    ratios
  );
  const retryHarvestTask = retryHarvestJob(
    vaultAddress,
    stakerAddress,
    maxGasPrice,
    slippage,
    tokensToHarvest
  );

  mainJob(
    vaultAddress,
    stakerAddress,
    maxGasPrice,
    slippage,
    tokensToHarvest,
    ratios,
    retryCompoundTask,
    retryHarvestTask
  );
})();
