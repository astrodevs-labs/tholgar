// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {ISwapper} from "./interfaces/ISwapper.sol";
import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {Pausable} from "openzeppelin-contracts/security/Pausable.sol";
import {ERC4626} from "solmate/mixins/ERC4626.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";
import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";
import {AFees} from "./abstracts/AFees.sol";
import {ASwapper} from "./abstracts/ASwapper.sol";
import {Errors} from "./utils/Errors.sol";

/// @author 0xtekgrinder
/// @title Vault contract
/// @notice Auto compounding vault for the warlord protocol with token to deposit being WAR and asset being stkWAR
contract Vault is ERC4626, Ownable2Step, Pausable, ReentrancyGuard, AFees, ASwapper {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when a staker is updated
     */
    event StakerUpdated(address oldStaker, address newStaker);

    /*//////////////////////////////////////////////////////////////
                          MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Address of the stkWAR token
     */
    address public staker;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address initialStaker,
        uint256 initialHarvestFee,
        address initialFeeRecipient,
        address initialFeeToken,
        address initialSwapRouter,
        address definitiveAsset
    )
        ERC4626(ERC20(definitiveAsset), "acWARToken", "acWAR")
        AFees(initialHarvestFee, initialFeeRecipient, initialFeeToken)
        ASwapper(initialSwapRouter)
    {
        if (initialStaker == address(0) || definitiveAsset == address(0)) {
            revert Errors.ZeroAddress();
        }

        staker = initialStaker;

        ERC20(definitiveAsset).safeApprove(initialStaker, type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice update the staker contract to a new one
     * @param newStaker the new staker contract
     * @custom:requires owner
     */
    function setStaker(address newStaker) external nonReentrant onlyOwner {
        if (newStaker == address(0)) revert Errors.ZeroAddress();
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
     * @notice Recover ERC2O tokens in the contract
     * @dev Recover ERC2O tokens in the contract
     * @param token Address of the ERC2O token
     * @return bool: success
     */
    function recoverERC20(address token) external onlyOwner returns (bool) {
        if (token == address(0)) revert Errors.ZeroAddress();

        uint256 amount = ERC20(token).balanceOf(address(this));
        if (amount == 0) revert Errors.ZeroValue();

        ERC20(token).safeTransfer(owner(), amount);

        return true;
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                            ERC4626 LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev totalAssets is the total number of stkWAR
     */
    function totalAssets() public view override returns (uint256) {
        uint256 assets = ERC20(staker).balanceOf(address(this));

        return assets;
    }

    /**
     * @custom:notpaused when not paused
     */
    function deposit(uint256 assets, address receiver) public virtual override whenNotPaused returns (uint256 shares) {
        return super.deposit(assets, receiver);
    }

    /**
     * @custom:notpaused when not paused
     */
    function mint(uint256 shares, address receiver) public virtual override whenNotPaused returns (uint256 assets) {
        return super.mint(shares, receiver);
    }

    /**
     * @custom:notpaused when not paused
     */
    function withdraw(uint256 assets, address receiver, address owner)
        public
        virtual
        override
        whenNotPaused
        returns (uint256 shares)
    {
        return super.withdraw(assets, receiver, owner);
    }

    /**
     * @custom:notpaused when not paused
     */
    function redeem(uint256 shares, address receiver, address owner)
        public
        virtual
        override
        whenNotPaused
        returns (uint256 assets)
    {
        return super.redeem(shares, receiver, owner);
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
