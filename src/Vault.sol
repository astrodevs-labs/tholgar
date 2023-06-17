// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.16;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {ISwap} from "./interfaces/ISwap.sol";
import {Owner} from "warlord/utils/Owner.sol";
import {ERC4626} from "solmate/mixins/ERC4626.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";
import {WAR} from "./utils/constants.sol";

contract Vault is ERC4626, Owner {
    using FixedPointMathLib for uint256;

    address public swap;
    address public staker;

    constructor(address initialStaker, address initialSwap, address definitiveAsset)
        ERC4626(ERC20(definitiveAsset), "acWARToken", "acWAR")
    {
        swap = initialSwap;
        staker = initialStaker;

        ERC20(WAR).approve(initialStaker, type(uint256).max);
    }

    function setSwap(address newSwap) external onlyOwner {
        swap = newSwap;
    }

    function setStaker(address newStaker) external onlyOwner {
        uint256 stakerBalance = ERC20(staker).balanceOf(address(this));
        if (stakerBalance != 0) {
            IStaker(staker).unstake(stakerBalance, address(this));
        }
        ERC20(WAR).approve(staker, 0);

        ERC20(WAR).approve(newStaker, type(uint256).max);
        uint256 warBalance = asset.balanceOf(address(this));
        if (warBalance != 0) {
            IStaker(newStaker).stake(warBalance, address(this));
        }
        staker = newStaker;
    }

    function afterDeposit(uint256 assets, uint256 /* shares */ ) internal override {
        IStaker(staker).stake(assets, address(this));
    }

    function beforeWithdraw(uint256 assets, uint256 /*shares */ ) internal override {
        IStaker(staker).unstake(assets, address(this));
    }

    function totalAssets() public view override returns (uint256) {
        uint256 assets = ERC20(staker).balanceOf(address(this));

        return assets;
    }
}
