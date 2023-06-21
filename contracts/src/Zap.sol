// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.20;

import {ReentrancyGuard} from "solmate/utils/ReentrancyGuard.sol";
import {ERC4626} from "solmate/mixins/ERC4626.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {IMinter} from "warlord/interfaces/IMinter.sol";

contract Zap is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                  EVENTS
    //////////////////////////////////////////////////////////////*/

    event ZapHappened(address indexed sender, address indexed receiver, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                             ERRORS
    //////////////////////////////////////////////////////////////*/

    error ZeroAddress();
    error EmptyArray();
    error ZeroValue();
    error DifferentSizeArrays(uint256 length1, uint256 length2);

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    address public immutable asset;
    address public immutable vault;
    address public immutable minter;

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address definitiveAsset, address definitiveVault, address definitiveMinter) {
        if (definitiveAsset == address(0) || definitiveVault == address(0) || definitiveMinter == address(0)) {
            revert ZeroAddress();
        }
        asset = definitiveAsset;
        vault = definitiveVault;
        minter = definitiveMinter;

        IERC20(asset).safeApprove(vault, type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                              ZAP LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Zaps a given amount of tokens to mint WAR and stake it
     * @param token Address of the token to deposit
     * @param amount Amount to deposit
     * @param receiver Address to stake for
     * @return uint256 : Amount of WAR staked
     */
    function zap(address token, uint256 amount, address receiver) external nonReentrant returns (uint256) {
        if (amount == 0) revert ZeroValue();
        if (token == address(0) || receiver == address(0)) revert ZeroAddress();

        uint256 prevBalance = IERC20(asset).balanceOf(address(this));

        // Pull the token
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Mint WAR
        IERC20(token).safeIncreaseAllowance(address(minter), amount);
        IMinter(minter).mint(token, amount);

        uint256 mintedAmount = IERC20(asset).balanceOf(address(this)) - prevBalance;

        // Stake the WAR tokens for the receiver
        uint256 depositeddAmount = ERC4626(vault).deposit(mintedAmount, receiver);

        emit ZapHappened(msg.sender, receiver, depositeddAmount);

        return depositeddAmount;
    }

    /**
     * @notice Zaps given amounts of tokens to mint WAR and stake it
     * @param vlTokens List of token addresses to deposit
     * @param amounts Amounts to deposit for each token
     * @param receiver Address to stake for
     * @return uint256 : Amount of WAR staked
     */
    function zapMultiple(address[] calldata vlTokens, uint256[] calldata amounts, address receiver)
        external
        nonReentrant
        returns (uint256)
    {
        if (receiver == address(0)) revert ZeroAddress();
        uint256 length = vlTokens.length;
        if (length != amounts.length) revert DifferentSizeArrays(length, amounts.length);
        if (length == 0) revert EmptyArray();

        uint256 prevBalance = IERC20(asset).balanceOf(address(this));

        // for each token in the list
        for (uint256 i; i < length;) {
            address token = vlTokens[i];
            uint256 amount = amounts[i];
            if (amount == 0) revert ZeroValue();
            if (token == address(0)) revert ZeroAddress();

            // Pull the token
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

            // Mint WAR
            IERC20(token).safeIncreaseAllowance(address(minter), amount);
            IMinter(minter).mint(token, amount);

            unchecked {
                i++;
            }
        }

        // Get the total amount of WAR minted
        uint256 mintedAmount = IERC20(asset).balanceOf(address(this)) - prevBalance;

        // Stake the WAR tokens for the receiver
        uint256 depositeddAmount = ERC4626(vault).deposit(mintedAmount, receiver);

        emit ZapHappened(msg.sender, receiver, depositeddAmount);

        return depositeddAmount;
    }
}
