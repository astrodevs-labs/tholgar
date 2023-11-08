---
sidebar_position: 2
---

# Swapper

This is a contract designed to manage all the swaps for the vault. Currently, it uses a router to facilitate the exchange of tokens and return them to the sender. It is implemented as a separate contract to allow for flexibility in case the router paradigm undergoes significant changes in the future. The contract is intended to be used in a push/pull manner in conjunction with the **swap** function.

## State Variables

### swapRouter
Dex/aggregator router to be called for executing swaps

```solidity
address public swapRouter;
```

### tokenTransferAddress
Address for enabling token swaps

```solidity
address public tokenTransferAddress;
```

### vault
Address of the ERC-4626 vault

```solidity
address public vault;
```

## Functions

### onlyVault

```solidity
modifier onlyVault();
```

### constructor

```solidity
constructor(address initialOwner, address initialSwapRouter, address initialTokenTransferAddress)
    Owned2Step(initialOwner);
```

### setSwapRouter

Specify the Dex/aggregator router to be called for executing swaps

```solidity
function setSwapRouter(address newSwapRouter) external onlyOwner;
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newSwapRouter`|`address`|address of the router|

### setTokenTransferAddress

Establish the token proxy address to permit the swapping of tokens

```solidity
function setTokenTransferAddress(address newTokenTransferAddress) external onlyOwner;
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newTokenTransferAddress`|`address`|address of the token proxy|

### setVault

Set the vault address

```solidity
function setVault(address newVault) external onlyOwner;
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newVault`|`address`|address of the vault|

### recoverERC20

Recover ERC-2O tokens in the contract

```solidity
function recoverERC20(address token) external onlyOwner returns (bool);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|Address of the ERC2O token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|bool: success|

### swap

Swap tokens using the router/aggregator

*The calldatas should set the recipient of the tokens to the vault*

```solidity
function swap(address[] calldata tokens, bytes[] calldata callDatas) external onlyVault;
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokens`|`address[]`|array of tokens to swap|
|`callDatas`|`bytes[]`|array of bytes to call the router/aggregator|

### _performRouterSwap

Perform the swap using the router/aggregator

```solidity
function _performRouterSwap(bytes calldata callData) internal;
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`callData`|`bytes`|bytes to call the router/aggregator|

## Events

### SwapRouterUpdated

Event emitted when the swap router is updated

```solidity
event SwapRouterUpdated(address oldSwapRouter, address newSwapRouter);
```

### TokenTransferAddressUpdated

Event emitted when the token proxy is updated

```solidity
event TokenTransferAddressUpdated(address oldTokenTransferAddress, address newTokenTransferAddress);
```

### VaultUpdated

Event emitted when the vault is updated

```solidity
event VaultUpdated(address oldVault, address newVault);
```
