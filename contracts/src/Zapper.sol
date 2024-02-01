// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.20;

import { Errors } from "./utils/Errors.sol";
import { ERC20 } from "solmate/tokens/ERC20.sol";
import { SafeTransferLib } from "solady/utils/SafeTransferLib.sol";
import { IMinter } from "warlord/interfaces/IMinter.sol";
import { WETH9 } from "./interfaces/external/WETH.sol";
import { Allowance } from "./utils/Allowance.sol";
import { ERC4626 } from "solmate/tokens/ERC4626.sol";
import { Owned2Step } from "./utils/Owned2Step.sol";

/// @title Warlord Zapper Contract
/// @author centonze.eth
/// @dev This contract enables users to seamlessly convert any pair that is sufficiently liquid on Uniswap V3
/// into stkWar tokens for the Warlord protocol by Paladin.vote. The conversion route is designed as:
/// anyToken -> WETH (via Uniswap) -> either AURA or CVX based on the selected vlToken.
contract Zapper is Owned2Step {
    address public constant AURA = 0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF;
    address public constant CVX = 0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    // the address of the WAR token
    address public constant WAR = 0xa8258deE2a677874a48F5320670A869D74f0cbC1;

    // Contract allowed to mint war
    address public warMinter = 0x144a689A8261F1863c89954930ecae46Bd950341;
    /**
     * @notice Address of the ERC4626 vault
     */
    address public vault = 0x188cA46Aa2c7ae10C14A931512B62991D5901453;
    /**
     *  @notice Dex/aggregaor router to call to perform swaps
     */
    address public swapRouter;
    /**
     * @notice Address to allow to swap tokens
     */
    address public tokenTransferAddress;

    /// @notice This event is emitted when a zap operation occurs.
    /// @param token The token that was zapped.
    /// @param amount The amount of token that was zapped.
    /// @param mintedAmount The amount of WAR tokens minted as a result.
    /// @param receiver The address of the recipient of the WAR tokens.
    event Zapped(address indexed token, uint256 amount, uint256 mintedAmount, address receiver);

    /// @notice This event is emitted when the WarMinter address is changed.
    /// @param newMinter The new WarMinter address.
    event SetWarMinter(address newMinter);

    /// @notice This event is emitted when the WarStaker address is changed.
    /// @param newStaker The new WarStaker address.
    event SetWarStaker(address newStaker);
    /**
     *  @notice Event emitted when the swap router is updated
     */
    event SwapRouterUpdated(address oldSwapRouter, address newSwapRouter);
    /**
     *  @notice Event emitted when the token proxy is updated
     */
    event TokenTransferAddressUpdated(address oldTokenTransferAddress, address newTokenTransferAddress);
    /**
     *  @notice Event emitted when the vault is updated
     */
    event VaultUpdated(address oldVault, address newVault);

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address initialOwner, address initialSwapRouter, address initialTokenTransferAddress)
        Owned2Step(initialOwner)
    {
        if (initialSwapRouter == address(0) || initialTokenTransferAddress == address(0)) revert Errors.ZeroAddress();

        swapRouter = initialSwapRouter;
        tokenTransferAddress = initialTokenTransferAddress;
    }

    /*////////////////////////////////////////////
    /          Warlord allowance methods         /
    ////////////////////////////////////////////*/

    /// @dev Resets the allowances for Warlord-related interactions.
    function resetWarlordAllowances() external onlyOwner {
        SafeTransferLib.safeApprove(AURA, warMinter, type(uint256).max);
        SafeTransferLib.safeApprove(CVX, warMinter, type(uint256).max);
        SafeTransferLib.safeApprove(WAR, vault, type(uint256).max);
    }

    /// @dev Removes the allowances for Warlord-related interactions.
    function removeWarlordAllowances() external onlyOwner {
        SafeTransferLib.safeApprove(AURA, warMinter, 0);
        SafeTransferLib.safeApprove(CVX, warMinter, 0);
        SafeTransferLib.safeApprove(WAR, vault, 0);
    }

    function removeRouterAllowance(address token) external onlyOwner {
        SafeTransferLib.safeApprove(token, swapRouter, 0);
    }

    /*////////////////////////////////////////////
    /              Warlord setters               /
    ////////////////////////////////////////////*/

    /// @dev Changes the WarMinter contract address.
    /// @param _warMinter The new WarMinter contract address.
    function setWarMinter(address _warMinter) external onlyOwner {
        if (_warMinter == address(0)) revert Errors.ZeroAddress();
        warMinter = _warMinter;

        emit SetWarMinter(_warMinter);
    }

    /**
     * @notice Set the dex/aggregator router to call to perform swaps
     * @param newSwapRouter address of the router
     * @custom:requires owner
     */
    function setSwapRouter(address newSwapRouter) external onlyOwner {
        if (newSwapRouter == address(0)) revert Errors.ZeroAddress();

        address oldSwapRouter = swapRouter;
        swapRouter = newSwapRouter;

        emit SwapRouterUpdated(oldSwapRouter, newSwapRouter);
    }

    /**
     * @notice Set the token proxy address to allow to swap tokens
     * @param newTokenTransferAddress address of the token proxy
     * @custom:requires owner
     */
    function setTokenTransferAddress(address newTokenTransferAddress) external onlyOwner {
        if (newTokenTransferAddress == address(0)) revert Errors.ZeroAddress();

        address oldtokenTransferAddress = tokenTransferAddress;
        tokenTransferAddress = newTokenTransferAddress;

        emit TokenTransferAddressUpdated(oldtokenTransferAddress, newTokenTransferAddress);
    }

    /**
     * @notice Set the vault address
     * @param newVault address of the vault
     * @custom:requires owner
     */
    function setVault(address newVault) external onlyOwner {
        if (newVault == address(0)) revert Errors.ZeroAddress();

        address oldVault = vault;
        vault = newVault;

        emit VaultUpdated(oldVault, newVault);
    }

    /*////////////////////////////////////////////
    /                Zap Functions               /
    ////////////////////////////////////////////*/

    function _swap(address[] memory tokens, bytes[] memory callDatas) internal {
        uint256 length = tokens.length;

        for (uint256 i; i < length;) {
            address token = tokens[i];
            Allowance._approveTokenIfNeeded(token, tokenTransferAddress);
            _performRouterSwap(callDatas[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Perform the swap using the router/aggregator
     * @param callData bytes to call the router/aggregator
     */
    function _performRouterSwap(bytes memory callData) internal {
        (bool success, bytes memory retData) = swapRouter.call(callData);

        if (!success) {
            if (retData.length != 0) {
                assembly {
                    revert(add(32, retData), mload(retData))
                }
            }
            revert Errors.SwapError();
        }
    }

    function _swapAndMintSingleToken(
        address receiver,
        address token,
        address vlToken,
        bytes memory callDatas
    ) internal returns (uint256 stakedAmount) {
        address[] memory tokens = new address[](1);
        tokens[0] = token;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = callDatas;

        _swap(tokens, calldatas);
        uint256 amount = ERC20(vlToken).balanceOf(address(this));
        IMinter(warMinter).mint(vlToken, amount);
        stakedAmount = ERC20(WAR).balanceOf(address(this));
        ERC4626(vault).deposit(stakedAmount, receiver);

        emit Zapped(token, msg.value, stakedAmount, receiver);
    }

    function zapEtherToSingleToken(address receiver, address vlToken, bytes calldata callDatas)
        external
        payable
        returns (uint256 stakedAmount)
    {
        if (receiver == address(0)) revert Errors.ZeroAddress();
        if (msg.value == 0) revert Errors.ZeroValue();

        // Convert native eth to weth
        WETH9(WETH).deposit{ value: msg.value }();

        stakedAmount = _swapAndMintSingleToken(receiver, WETH, vlToken, callDatas);
    }

    function zapERC20ToSingleToken(
        address token,
        address vlToken,
        uint256 amount,
        address receiver,
        bytes calldata callDatas
    ) external returns (uint256 stakedAmount) {
        if (token == address(0)) revert Errors.ZeroAddress();
        if (receiver == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.ZeroValue();

        // Pull ether from sender to this contract
        SafeTransferLib.safeTransferFrom(token, msg.sender, address(this), amount);

        stakedAmount = _swapAndMintSingleToken(receiver, token, vlToken, callDatas);
    }

    function _swapAndMintMultipleTokens(
        address receiver,
        address token,
        address[] memory vlTokens,
        bytes[] memory callDatas
    ) internal returns (uint256 stakedAmount) {
        address[] memory tokens = new address[](callDatas.length);
        for (uint256 i; i < callDatas.length;) {
            tokens[i] = token;
            unchecked {
                ++i;
            }
        }

        _swap(tokens, callDatas);
        for (uint256 i; i < vlTokens.length;) {
            uint256 amount = ERC20(vlTokens[i]).balanceOf(address(this));
            IMinter(warMinter).mint(vlTokens[i], amount);
            unchecked {
                ++i;
            }
        }
        stakedAmount = ERC20(WAR).balanceOf(address(this));
        ERC4626(vault).deposit(stakedAmount, receiver);

        emit Zapped(token, msg.value, stakedAmount, receiver);
    }

    function zapEtherToMultipleTokens(address receiver, address[] calldata vlTokens, bytes[] calldata callDatas)
        external
        payable
        returns (uint256 stakedAmount)
    {
        if (receiver == address(0)) revert Errors.ZeroAddress();
        if (msg.value == 0) revert Errors.ZeroValue();

        // Convert native eth to weth
        WETH9(WETH).deposit{ value: msg.value }();

        stakedAmount = _swapAndMintMultipleTokens(receiver, WETH, vlTokens, callDatas);
    }

    function zapERC20ToMultipleTokens(
        address token,
        uint256 amount,
        address receiver,
        address[] calldata vlTokens,
        bytes[] calldata callDatas
    ) external returns (uint256 stakedAmount) {
        if (receiver == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.ZeroValue();

        // Pull ether from sender to this contract
        SafeTransferLib.safeTransferFrom(token, msg.sender, address(this), amount);

        stakedAmount = _swapAndMintMultipleTokens(receiver, token, vlTokens, callDatas);
    }
}
