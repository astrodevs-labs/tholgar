// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract SetHarvestFee is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_setHarvestFee_normal() public {
        vm.prank(owner);
        vault.setHarvestFee(100);
        assertEq(vault.harvestFee(), 100);
    }

    function test_setHarvestFee_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setHarvestFee(100);
    }

    function testFuzz_setHarvestFee_InvalidFee(uint256 amount) public {
        amount = bound(amount, 10001, UINT256_MAX);

        vm.expectRevert(Errors.InvalidFee.selector);
        vm.prank(owner);
        vault.setHarvestFee(10001);
    }
}