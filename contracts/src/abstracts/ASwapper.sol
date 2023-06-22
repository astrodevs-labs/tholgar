// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";
import {Errors} from "../utils/Errors.sol";

/**
 *  @title ASwapper contract
 *  @notice
 *  @author 0xMemoryGrinder
 */
abstract contract ASwapper is Ownable2Step {
    using SafeTransferLib for ERC20;
    using FixedPointMathLib for uint256;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when a output tokens and/or ratios are updated
     */
    event OutputTokensUpdated(OutputToken[] tokens);
    /**
     *  @notice Event emitted when a token is swapped
     */
    event TokenSwapped(address indexed token, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant MAX_WEIGHT = 100_000;

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Struct that represent a element in the list of output token and the respective ratio to perform the swap
     */
    struct OutputToken {
        address token;
        uint256 ratio; // weight (on MAX_WEIGHT total)
        uint256 decimals;
    }
    /**
     *  @notice list of tokens to swap to when receiving harvest rewards
     */

    OutputToken[] public outputTokens;

    /**
     *  @notice Dex/aggregaor router to call to perform swaps
     */
    address public swapRouter;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Modifier used to check if output tokens array does not have total weight that exceeds MAX_WEIGHT or if the array is empty
     */
    modifier verifyRatios(OutputToken[] memory newOutputTokens) {
        _checkRatios(newOutputTokens);
        _;
    }

    /**
     *  @notice Modifier implementation to check if output tokens array does not have total weight that exceeds MAX_WEIGHT or if the array is empty
     */
    function _checkRatios(OutputToken[] memory newOutputTokens) internal pure {
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
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address initialSwapRouter) {
        if (initialSwapRouter == address(0)) revert Errors.ZeroAddress();

        swapRouter = initialSwapRouter;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Must calll this function in order to let the contract work correctly
     */
    function setOutputTokens(OutputToken[] calldata newOutputTokens) external onlyOwner verifyRatios(newOutputTokens) {
        _copy(outputTokens, newOutputTokens);

        emit OutputTokensUpdated(newOutputTokens);
    }

    function setSwapRouter(address newSwapRouter) external onlyOwner {
        if (newSwapRouter == address(0)) revert Errors.ZeroAddress();

        swapRouter = newSwapRouter;
    }

    /*//////////////////////////////////////////////////////////////
                            SWAP LOGIC
    //////////////////////////////////////////////////////////////*/

    function _swap(address[] memory tokens, bytes[] calldata callDatas) internal {
        uint256 length = tokens.length;

        for (uint256 i; i < length;) {
            address token = tokens[i];
            emit TokenSwapped(token, ERC20(token).balanceOf(address(this)));
            _approveTokenIfNeeded(token, address(swapRouter));
            _performRouterSwap(callDatas[i]);
            unchecked {
                ++i;
            }
        }
    }

    function _performRouterSwap(bytes calldata callData) private {
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

    function getTokens() public view returns (address[] memory) {
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

    /*//////////////////////////////////////////////////////////////
                                UTILS
    //////////////////////////////////////////////////////////////*/

    function _approveTokenIfNeeded(address _token, address _spender) private {
        if (ERC20(_token).allowance(address(this), _spender) == 0) {
            ERC20(_token).safeApprove(_spender, type(uint256).max);
        }
    }

    function _copy(OutputToken[] storage dest, OutputToken[] calldata src) private {
        uint256 length = src.length;

        for (uint256 i; i < length;) {
            dest.push(src[i]);
            unchecked {
                ++i;
            }
        }
    }
}
