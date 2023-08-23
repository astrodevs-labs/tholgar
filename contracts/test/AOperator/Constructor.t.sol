// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AOperatorTest.sol";

contract Constructor is AOperatorTest {
    function test_constructor_Normal() public {
        assertEq(operator.operator(), bob, "operator should be bob");
    }

    function test_constructor_ZeroAddressOperator() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new AOperatorMock(address(0), owner);
    }
}
