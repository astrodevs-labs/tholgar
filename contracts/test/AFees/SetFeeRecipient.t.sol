// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AFeesTest.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract SetFeeRecipient is AFeesTest {
    function test_setFeeRecipient_Normal() public {
        vm.prank(owner);
        fees.setFeeRecipient(alice);
        assertEq(fees.feeRecipient(), alice, "FeeRecipient should be alice");
    }

    function test_setFeeRecipient_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        fees.setFeeRecipient(bob);
    }

    function test_setFeeRecipient_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        fees.setFeeRecipient(address(0));
    }
}