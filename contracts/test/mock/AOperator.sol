// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import { AOperator, Owned2Step } from "../../src/abstracts/AOperator.sol";

contract AOperatorMock is AOperator {
    constructor(address initialOperator, address initialOwner) Owned2Step(initialOwner) AOperator(initialOperator) { }
}
