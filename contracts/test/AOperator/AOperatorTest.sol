// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../BaseTest.sol";
import {AOperatorMock} from "../mock/AOperator.sol";
import {ERC20Mock} from "../mock/ERC20.sol";

contract AOperatorTest is BaseTest {
    AOperatorMock operator;

    event OperatorUpdated(address oldOperator, address newOperator);

    function setUp() public virtual {
        vm.startPrank(owner);

        operator = new AOperatorMock(bob);

        vm.stopPrank();
    }
}
