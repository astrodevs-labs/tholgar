// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import {AOperator} from "../../src/abstracts/AOperator.sol";

contract AOperatorMock is AOperator {
    constructor(address initialOperator) AOperator(initialOperator) {}
}
