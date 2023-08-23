// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import {AFees, Owned2Step} from "../../src/abstracts/AFees.sol";

contract AFeesMock is AFees {
    constructor(uint256 initialHarvestFee, address initialFeeRecipient, address initialFeeToken, address initialOwner)
        Owned2Step(initialOwner)
        AFees(initialHarvestFee, initialFeeRecipient, initialFeeToken)
    {}
}
