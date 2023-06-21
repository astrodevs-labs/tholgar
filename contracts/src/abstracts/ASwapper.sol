// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solmate/utils/FixedPointMathLib.sol";
import {Errors} from "../utils/Errors.sol";

/**
 *  @author 0xMemoryGrinder
 */
contract ASwapper is Ownable2Step {
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
     *  @notice Event emitted when an input reward token is swapped to feeToken
     */
    event InputTokenSwapped(address indexed token, uint256 amount);
    /**
     *  @notice Event emitted when feeToken is swapped to an output token
     */
    event OutputTokenSwapped(address indexed token, uint256 amount);

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
     *  @notice gelato caller address to allow access only to web3 function
     */
    address public gelato;
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

    /**
     *  @notice Modifier to allow only gelato to call functions
     */
    modifier onlyGelato() {
        if (msg.sender != gelato) revert Errors.NotGelato();
        _;
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

    function swap(address[] calldata inputTokens, bytes[] calldata inputCallsData, bytes[] calldata outputCallsData)
        public
        onlyGelato
    {
        _swapInput(inputTokens, inputCallsData);
        _swapOutput(outputCallsData);
    }

    function _swapInput(address[] calldata inputTokens, bytes[] calldata inputCallsData) private {
        uint256 length = inputTokens.length;

        for (uint256 i; i < length;) {
            address token = inputTokens[i];
            emit InputTokenSwapped(token, ERC20(token).balanceOf(address(this)));
            _approveTokenIfNeeded(token, address(swapRouter));
            _performRouterSwap(inputCallsData[i]);
            unchecked {
                ++i;
            }
        }
    }

    function _swapOutput(bytes[] calldata outputCallsData) private {
        uint256 length = outputCallsData.length;

        for (uint256 i; i < length;) {
            _performRouterSwap(outputCallsData[i]);
            address token = outputTokens[i].token;
            emit OutputTokenSwapped(token, ERC20(token).balanceOf(address(this)));
            unchecked {
                ++i;
            }
        }
    }

    function _performRouterSwap(bytes calldata callData) private {
        (bool success, bytes memory retData) = swapRouter.call(callData);

        if (!success) revert Errors.SwapError(retData);
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
