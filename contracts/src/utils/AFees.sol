// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";
import {Errors} from "./Errors.sol";

/// @author 0xtekgrinder
/// @title Abstract Fees contract
/// @notice Abstract contract to manage fees
abstract contract AFees is Ownable2Step {
    /*//////////////////////////////////////////////////////////////
                                  EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when harvestFee is updated
     */
    event HarvestFeeUpdated(uint256 oldHarvestFee, uint256 newHarvestFee);
    /**
     * @notice Event emitted when feeRecipient is updated
     */
    event FeeRecipientUpdated(address oldFeeRecipient, address newFeeRecipient);
    /**
     * @notice Event emitted when feeToken is updated
     */
    event FeeTokenUpdated(address oldFeeToken, address newFeeToken);

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Max BPS value (100%)
     */
    uint256 public constant MAX_BPS = 10_000;

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    uint256 public harvestFee;
    address public feeRecipient;
    address public feeToken;

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(uint256 initialHarvestFee, address initialFeeRecipient, address initialFeeToken) {
        if (initialHarvestFee > MAX_BPS) {
            revert Errors.InvalidFee();
        }
        harvestFee = initialHarvestFee;
        feeRecipient = initialFeeRecipient;
        feeToken = initialFeeToken;
    }

    /*//////////////////////////////////////////////////////////////
                              FEES LOGIC
    //////////////////////////////////////////////////////////////*/

    function setHarvestFee(uint256 newHarvestFee) external virtual onlyOwner {
        if (newHarvestFee > MAX_BPS) {
            revert Errors.InvalidFee();
        }

        uint256 oldHarvestFee = harvestFee;
        harvestFee = newHarvestFee;

        emit HarvestFeeUpdated(oldHarvestFee, newHarvestFee);
    }

    function setFeeRecipient(address newFeeRecipient) external virtual onlyOwner {
        if (newFeeRecipient == address(0)) revert Errors.ZeroAddress();

        address oldFeeRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;

        emit FeeRecipientUpdated(oldFeeRecipient, newFeeRecipient);
    }

    function setFeeToken(address newFeeToken) external virtual onlyOwner {
        if (newFeeToken == address(0)) revert Errors.ZeroAddress();

        address oldFeeToken = feeToken;
        feeToken = newFeeToken;

        emit FeeTokenUpdated(oldFeeToken, newFeeToken);
    }
}
