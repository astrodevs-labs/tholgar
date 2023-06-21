// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {Errors} from "./Errors.sol";

abstract contract AFees {
    /**
     * @notice Max BPS value (100%)
     */
    uint256 public constant MAX_BPS = 10_000;

    uint256 public harvestFee;
    address public feeRecipient;
    address public feeToken;

    event HarvestFeeUpdated(uint256 oldHarvestFee, uint256 newHarvestFee);
    event FeeRecipientUpdated(address oldFeeRecipient, address newFeeRecipient);
    event FeeTokenUpdated(address oldFeeToken, address newFeeToken);

    constructor(uint256 initialHarvestFee, address initialFeeRecipient, address initialFeeToken) {
        if (initialHarvestFee > MAX_BPS) {
            revert Errors.InvalidFee();
        }
        harvestFee = initialHarvestFee;
        feeRecipient = initialFeeRecipient;
        feeToken = initialFeeToken;
    }

    function setHarvestFee(uint256 newHarvestFee) external virtual {
        if (newHarvestFee > MAX_BPS) {
            revert Errors.InvalidFee();
        }

        uint256 oldHarvestFee = harvestFee;
        harvestFee = newHarvestFee;

        emit HarvestFeeUpdated(oldHarvestFee, newHarvestFee);
    }

    function setFeeRecipient(address newFeeRecipient) external virtual {
        if (newFeeRecipient == address(0)) revert Errors.ZeroAddress();

        address oldFeeRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;

        emit FeeRecipientUpdated(oldFeeRecipient, newFeeRecipient);
    }

    function setFeeToken(address newFeeToken) external virtual {
        if (newFeeToken == address(0)) revert Errors.ZeroAddress();

        address oldFeeToken = feeToken;
        feeToken = newFeeToken;

        emit FeeTokenUpdated(oldFeeToken, newFeeToken);
    }
}
