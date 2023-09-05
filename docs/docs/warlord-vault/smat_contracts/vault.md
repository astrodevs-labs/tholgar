---
sidebar_position: 1
---

# Vault

This is the main contract of the Warlord protocol. It allows user to deposit WAR that will then be staked in the Warlord staking contract. It also handles the harvest and compound logic of the vault. Some admions functions are here to handle fees and pause the contract if needed. The Vault itself can change staker but not the underlying asset.


## State Variables
### staker
Address of the stkWAR token


```solidity
address public staker;
```


### minter
Address of the WAR minter contract


```solidity
address public minter;
```


### swapper
Address of the swapper contract


```solidity
address public swapper;
```

### MAX_BPS
Max BPS value (100%)


```solidity
uint256 public constant MAX_BPS = 10_000;
```


### harvestFee
fee to be applied when harvesting rewards


```solidity
uint256 public harvestFee;
```


### feeRecipient
address to receive the harvest fee


```solidity
address public feeRecipient;
```


### feeToken
token to be used to pay the harvest fee


```solidity
address public feeToken;
```

### operator
operator caller address to allow access only to web3 function


```solidity
address public operator;
```


## Functions
### constructor


```solidity
constructor(
    address initialOwner,
    address initialStaker,
    address initialMinter,
    address initialSwapper,
    uint256 initialHarvestFee,
    address initialFeeRecipient,
    address initialFeeToken,
    address initialOperator,
    address definitiveAsset
)
    Owned2Step(initialOwner)
    ERC4626(ERC20(definitiveAsset), "Tholgar Warlord Token", "tWAR")
    AFees(initialHarvestFee, initialFeeRecipient, initialFeeToken)
    AOperator(initialOperator);
```

### setStaker

update the staker contract to a new one


```solidity
function setStaker(address newStaker) external onlyOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newStaker`|`address`|the new staker contract|

### setOperator


```solidity
function setOperator(address newOperator) external onlyOwner;
```

### setSwapper

update the swapper contract to a new one


```solidity
function setSwapper(address newSwapper) external onlyOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newSwapper`|`address`|the new swapper contract|


### setMinter

update the minter contract to a new one


```solidity
function setMinter(address newMinter) external onlyOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newMinter`|`address`|the new minter contract|


### setHarvestFee


```solidity
function setHarvestFee(uint256 newHarvestFee) external virtual onlyOwner;
```

### setFeeRecipient


```solidity
function setFeeRecipient(address newFeeRecipient) external virtual onlyOwner;
```

### setFeeToken


```solidity
function setFeeToken(address newFeeToken) external virtual onlyOwner;
```


### recoverERC20

Recover ERC2O tokens in the contract

*Recover ERC2O tokens in the contract*


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


### pause

Pause the contract


```solidity
function pause() external onlyOwner;
```

### unpause

Unpause the contract


```solidity
function unpause() external onlyOwner;
```

### totalAssets

*totalAssets is the total number of stkWAR*


```solidity
function totalAssets() public view override returns (uint256);
```

### deposit


```solidity
function deposit(uint256 assets, address receiver) public override whenNotPaused returns (uint256 shares);
```

### mint


```solidity
function mint(uint256 shares, address receiver) public override whenNotPaused returns (uint256 assets);
```

### withdraw


```solidity
function withdraw(uint256 assets, address receiver, address owner)
    public
    override
    whenNotPaused
    returns (uint256 shares);
```

### redeem


```solidity
function redeem(uint256 shares, address receiver, address owner)
    public
    override
    whenNotPaused
    returns (uint256 assets);
```

### afterDeposit

*stake assets after each deposit*


```solidity
function afterDeposit(uint256 assets, uint256) internal override;
```

### beforeWithdraw

*unstake assets before each withdraw to have enough WAR to transfer*


```solidity
function beforeWithdraw(uint256 assets, uint256) internal override;
```

### harvest

Harvest all rewards from staker

*calldatas should swap from all reward tokens to feeToken*


```solidity
function harvest(address[] calldata tokensToHarvest, address[] calldata tokensToSwap, bytes[] calldata callDatas)
    external
    nonReentrant
    onlyOperatorOrOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokensToHarvest`|`address[]`|tokens to harvest|
|`tokensToSwap`|`address[]`|tokens to swap to feeToken|
|`callDatas`|`bytes[]`|swapper routes to swap to feeToken|


### compound

Turn all rewards into more staked assets


```solidity
function compound(address[] calldata tokensToSwap, bytes[] calldata callDatas, address[] calldata tokensToMint)
    external
    nonReentrant
    onlyOperatorOrOwner;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokensToSwap`|`address[]`|tokens which includes the feeToken to swap to more assets|
|`callDatas`|`bytes[]`|swapper routes to swap to more assets|
|`tokensToMint`|`address[]`|tokens to mint more stkWAR|


## Events
### StakerUpdated
Event emitted when a staker is updated


```solidity
event StakerUpdated(address oldStaker, address newStaker);
```

### MinterUpdated
Event emitted when a minter is updated


```solidity
event MinterUpdated(address oldMinter, address newMinter);
```

### SwapperUpdated
Event emitted when a swapper is updated


```solidity
event SwapperUpdated(address oldSwapper, address newSwapper);
```

### Harvested
Event emitted when reward have been harvested


```solidity
event Harvested(uint256 amount);
```

### Compounded
Event emitted when rewards are compounded into more stkWAR


```solidity
event Compounded(uint256 amount);
```

### HarvestFeeUpdated
Event emitted when harvestFee is updated


```solidity
event HarvestFeeUpdated(uint256 oldHarvestFee, uint256 newHarvestFee);
```

### FeeRecipientUpdated
Event emitted when feeRecipient is updated


```solidity
event FeeRecipientUpdated(address oldFeeRecipient, address newFeeRecipient);
```

### FeeTokenUpdated
Event emitted when feeToken is updated


```solidity
event FeeTokenUpdated(address oldFeeToken, address newFeeToken);
```

### OperatorUpdated
Event emitted when a output tokens and/or ratios are updated


```solidity
event OperatorUpdated(address oldOperator, address newOperator);
```