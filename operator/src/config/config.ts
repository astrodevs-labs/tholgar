import "dotenv/config";

class Config {
    static slippage(required = true): number {
        return parseFloat(this.getEnv("SLIPPAGE", required));
    }

    static maxGasPrice(required = true): number {
        return parseFloat(this.getEnv("MAX_GAS_PRICE", required));
    }

    static vaultAddress(required = true): string {
        return this.getEnv("VAULT_ADDRESS", required);
    }

    static stakerAddress(required = true): string {
        return this.getEnv("STAKER_ADDRESS", required);
    }

    static jsonRpcUrl(required = true): string {
        return this.getEnv("JSON_RPC_URL", required);
    }

    static privateKey(required = true): string {
        return this.getEnv("PRIVATE_KEY", required);
    }

    static etherscanApiKey(required = true): string {
        return this.getEnv("ETHERSCAN_API_KEY", required);
    }

    static etherscanApiUrl(required = true): string {
        return this.getEnv("ETHERSCAN_API_URL", required);
    }

    static paraswapApiUrl(required = true): string {
        return this.getEnv("PARASWAP_API_URL", required);
    }

    private static getEnv(name: string, required: boolean): string {
        if (!process.env[name]) {
            if (required) {
                throw new Error(`${name} is not set`);
            } else {
                return "";
            }
        }
        return process.env[name] as string;
    }
}

export default Config;