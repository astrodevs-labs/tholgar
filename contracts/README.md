# Contracts

## Overview

This is a foundry project for the contracts of the Tholgar protocol.\
The Vault is based on ERC4626 and use a Swapper contract to interact with a router/AMM.\
And to simplify the usage of the Vault, a Zap contract is used to deposit tokens.

## Getting started

First of all you need to setup your environment. You can do that by copying the `.env.example` file to `.env` and filling in the values.

```bash
cp .env.example .env
```

Then, you can compile the contracts with the following command:

```bash
forge compile
```

## Testing

You can run the tests with the following command:

```bash
forge test
```

## Deploying

You can deploy the contracts with the following command:

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url "${{MAINNET_RPC_URL}}" --broadcast
```