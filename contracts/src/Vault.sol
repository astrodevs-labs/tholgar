// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.20;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {ISwapper} from "./interfaces/ISwapper.sol";
import {Ownable2Step, Ownable} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {ERC4626} from "solmate/mixins/ERC4626.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";

/// @author 0xtekgrinder
/// @title Vault contract
/// @notice Auto compounding vault for the warlord protocol with token to deposit being WAR and asset being stkWAR
contract Vault is ERC4626, Ownable2Step {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;

    /**
     * @notice Address of the contract to swap rewards
     */
    address public swapper;
    /**
     * @notice Address of the stkWAR token
     */
    address public staker;
    /**
     * @notice Address of the contract to get the ratios of token to swap
     */
    address public ratios;

    error ZeroAddress();

    /**
     * @notice Event emitted when a staker is updated
     */
    event StakerUpdated(address oldStaker, address newStaker);
    /**
     * @notice Event emitted when a swapper is updated
     */
    event SwapperUpdated(address oldSwapper, address newSwapper);
    /**
     * @notice Event emitted when a ratios is updated
     */
    event RatiosUpdated(address oldRatios, address newRatios);

    constructor(address initialStaker, address initialSwapper, address initialRatios, address definitiveAsset)
        Ownable(msg.sender)
        ERC4626(ERC20(definitiveAsset), "acWARToken", "acWAR")
    {
        if (
            initialStaker == address(0) || initialSwapper == address(0) || initialRatios == address(0)
                || definitiveAsset == address(0)
        ) revert ZeroAddress();

        swapper = initialSwapper;
        staker = initialStaker;
        ratios = initialRatios;

        ERC20(definitiveAsset).safeApprove(initialStaker, type(uint256).max);
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
     * @param newSwapper the new swapper contract
     * @custom:requires owner
     */
    function setSwapper(address newSwapper) external onlyOwner {
        if (newSwapper == address(0)) revert ZeroAddress();

        address oldSwapper = swapper;
        swapper = newSwapper;

        emit SwapperUpdated(oldSwapper, newSwapper);
    }

    /**
     * @notice update the ratios contract to a new one
     * @param newRatios the new ratios contract
     * @custom:requires owner
     */
    function setRatios(address newRatios) external onlyOwner {
        if (newRatios == address(0)) revert ZeroAddress();

        address oldRatios = ratios;
        ratios = newRatios;

        emit RatiosUpdated(oldRatios, newRatios);
    }

    /**
     * @notice update the staker contract to a new one
     * @param newStaker the new staker contract
     * @custom:requires owner
     */
    function setStaker(address newStaker) external onlyOwner {
        if (newStaker == address(0)) revert ZeroAddress();
        address oldStaker = staker;

        staker = newStaker;
        emit StakerUpdated(oldStaker, newStaker);

        // Unstake all wars from old staker
        uint256 stakerBalance = ERC20(oldStaker).balanceOf(address(this));
        if (stakerBalance != 0) {
            IStaker(oldStaker).unstake(stakerBalance, address(this));
        }
        // revoke allowance from old staker
        ERC20(address(asset)).safeApprove(oldStaker, 0);

        // approve all war tokens to be spent by new staker
        ERC20(address(asset)).safeApprove(newStaker, type(uint256).max);

        // Restake all tokens
        uint256 warBalance = asset.balanceOf(address(this));
        if (warBalance != 0) {
            IStaker(newStaker).stake(warBalance, address(this));
        }
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
