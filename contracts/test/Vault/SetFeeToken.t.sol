// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract SetFeeToken is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_setFeeToken_Normal() public {
        vm.prank(owner);
        vault.setFeeToken(address(usdc));
        assertEq(address(vault.feeToken()), address(usdc), "FeeToken should be usdc");
    }

    function test_setFeeToken_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setFeeToken(address(usdc));
    }

    function test_setFeeToken_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setFeeToken(address(0));
    }
}