# Operator

## Overview

This operator is a software which is meant to compound and harvest rewards of the vault automatically.\
There is two way to use it, one is to run it and let the cronjob execute the compound and harvest at a specific time.\
The other way is to create the calldata to call harvest and compound functions.

## Getting started

First of all you need to setup your environment. You can do that by copying the `.env.example` file to `.env` and filling in the values.

```bash
cp .env.example .env
```

Then, you can install the dependencies with the following command:

```bash
yarn install
```

## Running

You can run the operator with the following command:

```bash
yarn start
```

### Calldata

To only generate the calldata you have the `HARVEST` and `COMPOUND` environment variables to set to `true`.

### Cronjob

And on the other side if you want to run the cronjob you have to set the `HARVEST` and `COMPOUND` environment variables to `false`.
