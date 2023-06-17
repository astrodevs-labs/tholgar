// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.16;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {ISwap} from "./interfaces/ISwap.sol";
import {Owner} from "warlord/utils/Owner.sol";
import {ERC4626} from "solmate/mixins/ERC4626.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";

/// @author 0xtekgrinder
/// @title Vault contract
/// @notice This contract is the auto compounding vault for the warlord protocol
contract Vault is ERC4626, Owner {
    using FixedPointMathLib for uint256;

    address public swap;
    address public staker;
    address public ratios;

    constructor(address initialStaker, address initialSwap, address initialRatios, address definitiveAsset)
        ERC4626(ERC20(definitiveAsset), "acWARToken", "acWAR")
    {
        swap = initialSwap;
        staker = initialStaker;
        ratios = initialRatios;

        ERC20(definitiveAsset).approve(initialStaker, type(uint256).max);
    }

    /**
     * @dev totalAssets is the total number of stkWAR
     */
    function totalAssets() public view override returns (uint256) {
        uint256 assets = ERC20(staker).balanceOf(address(this));

        return assets;
    }

    /**
     * @notice update the swapper contract to a new one
     * @param newSwap the new swapper contract
     * @custom:requires owner
     */
    function setSwap(address newSwap) external onlyOwner {
        swap = newSwap;
    }

    /**
     * @notice update the ratios contract to a new one
     * @param newRatios the new ratios contract
     * @custom:requires owner
     */
    function setRatios(address newRatios) external onlyOwner {
        ratios = newRatios;
    }

    /**
     * @notice update the staker contract to a new one
     * @param newStaker the new staker contract
     * @custom:requires owner
     */
    function setStaker(address newStaker) external onlyOwner {
        // Unstake all wars from old staker
        uint256 stakerBalance = ERC20(staker).balanceOf(address(this));
        if (stakerBalance != 0) {
            IStaker(staker).unstake(stakerBalance, address(this));
        }
        // revoke allowance from old staker
        ERC20(address(asset)).approve(staker, 0);

        // approve all war tokens to be spent by new staker
        ERC20(address(asset)).approve(newStaker, type(uint256).max);

        // Restake all tokens
        uint256 warBalance = asset.balanceOf(address(this));
        if (warBalance != 0) {
            IStaker(newStaker).stake(warBalance, address(this));
        }

        staker = newStaker;
    }

    /**
     * @dev stake assets after each deposit
     */
    function afterDeposit(uint256 assets, uint256 /* shares */ ) internal override {
        IStaker(staker).stake(assets, address(this));
    }

    /**
     * @dev unstake assets before each withdraw to have enough WAR to transfer
     */
    function beforeWithdraw(uint256 assets, uint256 /*shares */ ) internal override {
        IStaker(staker).unstake(assets, address(this));
    }
}
