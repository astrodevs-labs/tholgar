// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AFeesTest.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract SetFeeRecipient is AFeesTest {
    function test_setFeeRecipient_Normal(address recipient) public {
        vm.assume(recipient != address(0));

        vm.prank(owner);
        fees.setFeeRecipient(recipient);
        assertEq(fees.feeRecipient(), recipient, "FeeRecipient should be recipient");
    }

    function test_setFeeRecipient_NotOwner(address recipient) public {
        vm.assume(recipient != address(0));

        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        fees.setFeeRecipient(recipient);
    }

    function test_setFeeRecipient_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        fees.setFeeRecipient(address(0));
    }
}
