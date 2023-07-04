// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.20;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {Errors} from "../utils/Errors.sol";

/**
 *  @title ASwapper contract
 *  @notice Provide swapper functions to swap tokens using a router/aggregator
 *  @author 0xMemoryGrinder
 */
abstract contract ASwapper is Ownable2Step {
    using SafeTransferLib for ERC20;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when a output tokens and/or ratios are updated
     */
    event OutputTokensUpdated(OutputToken[] tokens);
    /**
     *  @notice Event emitted when the swap router is updated
     */
    event SwapRouterUpdated(address oldSwapRouter, address newSwapRouter);
    /**
     *  @notice Event emitted when the token proxy is updated
     */
    event TokenTransferAddressUpdated(address oldTokenTransferAddress, address newTokenTransferAddress);

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Max WEIGHT value (100%)
     */
    uint256 public constant MAX_WEIGHT = 10_000;

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Struct that represent a element in the list of output token and the respective ratio to perform the swap
     */
    struct OutputToken {
        address token; // address of the token
        uint256 ratio; // weight (on MAX_WEIGHT total)
    }
    /**
     *  @notice list of tokens to swap to when receiving harvest rewards
     */

    OutputToken[] public outputTokens;

    /**
     *  @notice Dex/aggregaor router to call to perform swaps
     */
    address public swapRouter;
    /**
     * @notice Address to allow to swap tokens
     */
    address public tokenTransferAddress;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address initialSwapRouter, address initialTokenTransferAddress) {
        if (initialSwapRouter == address(0) || initialTokenTransferAddress == address(0)) revert Errors.ZeroAddress();

        swapRouter = initialSwapRouter;
        tokenTransferAddress = initialTokenTransferAddress;
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Return the list of output tokens addresses
     * @return tokens array of addresses
     */
    function getOutputTokenAddresses() public view returns (address[] memory) {
        uint256 length = outputTokens.length;
        address[] memory tokens = new address[](length);

        for (uint256 i; i < length;) {
            tokens[i] = outputTokens[i].token;
            unchecked {
                ++i;
            }
        }
        return tokens;
    }

    /**
     * @notice Return a output token ratio based on the token address
     * @param token address of the token to get the ratio
     * @return ratio of the token
     */
    function getOutputTokenRatio(address token) public view returns (uint256) {
        uint256 length = outputTokens.length;

        for (uint256 i; i < length;) {
            if (outputTokens[i].token == token) return outputTokens[i].ratio;
            unchecked {
                ++i;
            }
        }
        return 0;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Set the list of output tokens and the respective ratios
     * Must call this function in order to let the contract work correctly
     * The sum of all ratios must be equal to MAX_WEIGHT
     * @param newOutputTokens array of OutputToken struct
     * @custom:requires owner
     */
    function setOutputTokens(OutputToken[] calldata newOutputTokens) external onlyOwner {
        uint256 total;
        uint256 length = newOutputTokens.length;

        if (length == 0) revert Errors.NoOutputTokens();
        for (uint256 i; i < length;) {
            total += newOutputTokens[i].ratio;
            unchecked {
                ++i;
            }
        }
        if (total > MAX_WEIGHT) revert Errors.RatioOverflow();

        _copy(outputTokens, newOutputTokens);

        emit OutputTokensUpdated(newOutputTokens);
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

    /*//////////////////////////////////////////////////////////////
                            SWAP LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Swap tokens using the router/aggregator
     * @param tokens array of tokens to swap
     * @param callDatas array of bytes to call the router/aggregator
     */
    function _swap(address[] memory tokens, bytes[] calldata callDatas) internal {
        uint256 length = tokens.length;

        for (uint256 i; i < length;) {
            address token = tokens[i];
            _approveTokenIfNeeded(token, tokenTransferAddress);
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
    function _performRouterSwap(bytes calldata callData) internal {
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

    /*//////////////////////////////////////////////////////////////
                                UTILS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Approve the router/aggregator to spend the token if needed
     * @param _token address of the token to approve
     * @param _spender address of the router/aggregator
     */
    function _approveTokenIfNeeded(address _token, address _spender) internal {
        if (ERC20(_token).allowance(address(this), _spender) == 0) {
            ERC20(_token).safeApprove(_spender, type(uint256).max);
        }
    }

    /**
     * @notice Copy a OutputToken array to a OutputToken storage array
     * set the dest length to 0 before copying
     * @param dest OutputToken storage array
     * @param src OutputToken calldata array
     */
    function _copy(OutputToken[] storage dest, OutputToken[] calldata src) internal {
        // set length to 0 before copying
        assembly {
            sstore(dest.slot, 0)
        }

        uint256 length = src.length;
        for (uint256 i; i < length;) {
            dest.push(src[i]);
            unchecked {
                ++i;
            }
        }
    }
}
