// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.20;

import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {Errors} from "../utils/Errors.sol";

abstract contract AWeightedTokens is Ownable2Step {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when a output tokens and/or ratios are updated
     */
    event WeightedTokensUpdated(WeightedToken[] tokens);

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Max WEIGHT value (100%)swap
     */
    uint256 public constant MAX_WEIGHT = 10_000;

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Struct that represent a element in the list of output token and the respective ratio to perform the swap
     */
    struct WeightedToken {
        address token; // address of the token
        uint256 ratio; // weight (on MAX_WEIGHT total)
    }
    /**
     *  @notice list of tokens to swap to when receiving harvest rewards
     */

    WeightedToken[] public weightedTokens;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Return the list of output tokens addresses
     * @return tokens array of addresses
     */
    function getWeightedTokenAddresses() public view returns (address[] memory) {
        uint256 length = weightedTokens.length;
        address[] memory tokens = new address[](length);

        for (uint256 i; i < length;) {
            tokens[i] = weightedTokens[i].token;
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
    function getWeightedTokenRatio(address token) public view returns (uint256) {
        uint256 length = weightedTokens.length;

        for (uint256 i; i < length;) {
            if (weightedTokens[i].token == token) return weightedTokens[i].ratio;
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
     * @param newWeightedTokens array of WeightedToken struct
     * @custom:requires owner
     */
    function setWeightedTokens(WeightedToken[] calldata newWeightedTokens) public virtual onlyOwner {
        uint256 total;
        uint256 length = newWeightedTokens.length;

        if (length == 0) revert Errors.NoWeightedTokens();
        for (uint256 i; i < length;) {
            total += newWeightedTokens[i].ratio;
            unchecked {
                ++i;
            }
        }
        if (total > MAX_WEIGHT) revert Errors.RatioOverflow();

        _copy(weightedTokens, newWeightedTokens);

        emit WeightedTokensUpdated(newWeightedTokens);
    }

    /*//////////////////////////////////////////////////////////////
                                UTILS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Copy a WeightedToken array to a WeightedToken storage array
     * set the dest length to 0 before copying
     * @param dest WeightedToken storage array
     * @param src WeightedToken calldata array
     */
    function _copy(WeightedToken[] storage dest, WeightedToken[] calldata src) internal {
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
