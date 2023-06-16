// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.16;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {ISwap} from "./interfaces/ISwap.sol";
import {Owner} from "warlord/utils/Owner.sol";
import {ERC4626} from "solmate/mixins/ERC4626.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";

contract Vault is ERC4626, Owner {
    using FixedPointMathLib for uint256;

    ISwap private _swap;
    IStaker private _staker;

    constructor(ISwap initialSwap, IStaker initialStaker, ERC20 definitiveAsset) ERC4626(definitiveAsset, "acWARToken", "acWAR") {
        _swap = initialSwap;
        _staker = initialStaker;
    }

    function setSwap(ISwap newSwap) external onlyOwner {
        _swap = newSwap;
    }

    function setStaker(IStaker newStaker) external onlyOwner {
        _staker.unstake(_staker.balanceOf(address(this)), address(this));
        newStaker.stake(asset.balanceOf(address(this)), address(this));

        _staker = newStaker;
    }

    function afterDeposit(uint256 assets, uint256 /* shares */) internal override {
        _staker.stake(assets, address(this));
    }

    function beforeWithdraw(uint256 assets, uint256 /*shares */) internal override {
        _staker.unstake(assets, address(this));
    }

    function totalAssets() public view override returns (uint256) {
        uint256 assets = _staker.balanceOf(address(this));

        return assets;
    }
}
