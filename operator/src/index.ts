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

    cron.schedule("0 30 * * * *", async () => {
        await harvest(vaultAddress, stakerAddress, maxGasPrice, slippage);
    });
    cron.schedule("0 30 * * * *", async () => {
        await compound(vaultAddress, maxGasPrice, slippage);
    });
})()