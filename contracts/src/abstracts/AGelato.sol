// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import {Errors} from "../utils/Errors.sol";

/**
 *  @title AGelato contract
 *  @notice Provide gelato checking
 *  @author 0xMemoryGrinder
 */
abstract contract AGelato {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Event emitted when a output tokens and/or ratios are updated
     */
    event GelatoUpdated(address gelato);

    /*//////////////////////////////////////////////////////////////
                            MUTABLE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice gelato caller address to allow access only to web3 function
     */
    address public gelato;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

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

    constructor(address initialGelato) {
        if (initialGelato == address(0)) revert Errors.ZeroAddress();

        gelato = initialGelato;
        emit GelatoUpdated(gelato);
    }
}
