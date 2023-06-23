// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {Errors} from "../utils/Errors.sol";
import {Ownable2Step} from "openzeppelin-contracts/access/Ownable2Step.sol";

/**
 *  @title AOperator contract
 *  @notice Provide operator checking
 *  @author 0xMemoryGrinder
 */
abstract contract AOperator is Ownable2Step {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when a output tokens and/or ratios are updated
     */
    event OperatorUpdated(address operator);

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice operator caller address to allow access only to web3 function
     */
    address public operator;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Modifier to allow only operator to call functions
     */
    modifier onlyOperator() {
        if (msg.sender != operator) revert Errors.NotOperator();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address initialOperator) {
        if (initialOperator == address(0)) revert Errors.ZeroAddress();

        operator = initialOperator;
        emit OperatorUpdated(operator);
    }

    /*//////////////////////////////////////////////////////////////
                               CONTRACT LOGIC
    //////////////////////////////////////////////////////////////*/

    function setOperator(address newOperator) external onlyOwner {
        if (newOperator == address(0)) revert Errors.ZeroAddress();

        operator = newOperator;
        emit OperatorUpdated(newOperator);
    }
}