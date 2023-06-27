// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract SetFeeRecipient is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_setFeeRecipient_normal() public {
        vm.prank(owner);
        vault.setFeeRecipient(alice);
        assertEq(vault.feeRecipient(), alice);
    }

    function test_setFeeRecipient_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setFeeRecipient(bob);
    }

    function test_setFeeRecipient_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setFeeRecipient(address(0));
    }
}