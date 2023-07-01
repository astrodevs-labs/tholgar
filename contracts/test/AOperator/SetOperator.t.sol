// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AOperatorTest.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract SetOperator is AOperatorTest {
    function test_setOperator_Normal(address newOperator) public {
        vm.assume(newOperator != address(0));

        vm.expectEmit(true, true, false, true);
        emit OperatorUpdated(operator.operator(), newOperator);

        vm.prank(owner);
        operator.setOperator(newOperator);
        assertEq(operator.operator(), newOperator, "Operator should be newOperator");
    }

    function test_setOperator_NotOwner(address newOperator) public {
        vm.assume(newOperator != address(0));

        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        operator.setOperator(newOperator);
    }

    function test_setOperator_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        operator.setOperator(address(0));
    }
}
