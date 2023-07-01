// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import {AFees} from "../../src/abstracts/AFees.sol";

contract AFeesMock is AFees {
    constructor(uint256 initialHarvestFee, address initialFeeRecipient, address initialFeeToken)
        AFees(initialHarvestFee, initialFeeRecipient, initialFeeToken)
    {}
}
