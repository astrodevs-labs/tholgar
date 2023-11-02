---
sidebar_position: 3
---

# Zap

This is a utility contract designed to simplify the deposit of $AURA/$CVX into the Vault. It initiates the process by minting $WAR in an amount equivalent to the $AURA/$CVX you wish to deposit, and then deposits it into the Vault in exchange for $tWAR.

## State Variables

### asset

Address of $WAR token

```solidity
address public immutable asset;
```

### vault

Address of the auto-compounding $WAR Vault

```solidity
address public immutable vault;
```

### minter

Address of the $WAR minter

```solidity
address public immutable minter;
```

## Functions

### constructor

```solidity
constructor(address definitiveAsset, address definitiveVault, address definitiveMinter);
```

### zap

Zaps a specified amount of tokens to mint $WAR and deposit it

```solidity
function zap(address token, uint256 amount, address receiver)
    external
    nonReentrant
    returns (uint256);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|Address of the token to deposit|
|`amount`|`uint256`|Amount to deposit|
|`receiver`|`address`|Address to stake for|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|uint256 : Amount of shares minted|

### zapMultiple

Zaps multiple specified amounts of tokens to mint $WAR and deposit it

```solidity
function zapMultiple(address[] calldata vlTokens, uint256[] calldata amounts, address receiver)
    external
    nonReentrant
    returns (uint256);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`vlTokens`|`address[]`|List of token addresses to deposit|
|`amounts`|`uint256[]`|Amounts to deposit for each token|
|`receiver`|`address`|Address to stake for|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|uint256 : Amount of shares minted|

## Events

### ZapHappened

Event emitted when a zap happens

```solidity
event ZapHappened(address indexed sender, address indexed receiver, uint256 shares);
```
