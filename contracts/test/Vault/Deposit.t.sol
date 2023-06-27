// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Deposit is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_deposit_ZeroShares() public {
        vm.startPrank(alice);
        vm.expectRevert("ZERO_SHARES");
        vault.deposit(0, alice);
        vm.stopPrank();
    }

    function test_deposit_Normal(uint256 amount, address pranker) public {
        amount = bound(amount, 1, 3000 ether);
        vm.assume(pranker != owner);
        vm.assume(pranker != address(0));

        deal(address(vault.asset()), pranker, amount);

        vm.startPrank(pranker);
        vault.asset().approve(address(vault), amount);
        vault.deposit(amount, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(address(staker)), amount, 18, "Staker should have received the assets");
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, 18, "Vault should have 0 assets");
        assertEqDecimal(staker.balanceOf(address(vault)), amount, 18, "Vault should have received the shares");
        assertEqDecimal(vault.totalAssets(), amount, 18, "Vault should have 0 assets");
        assertEqDecimal(vault.balanceOf(pranker), amount, 18, "Pranker should have received the shares");
    }

    function testFuzz_deposit_Multiple(uint256 amount1, uint256 amount2, address pranker1, address pranker2) public {
        amount1 = bound(amount1, 1, 3000 ether);
        amount2 = bound(amount2, 1, 3000 ether);
        vm.assume(pranker1 != owner);
        vm.assume(pranker2 != owner);
        vm.assume(pranker1 != pranker2);
        vm.assume(pranker1 != address(0));
        vm.assume(pranker2 != address(0));

        deal(address(vault.asset()), pranker1, amount1);
        deal(address(vault.asset()), pranker2, amount2);

        vm.startPrank(pranker1);
        vault.asset().approve(address(vault), amount1);
        vault.deposit(amount1, pranker1);
        vm.stopPrank();

        vm.startPrank(pranker2);
        vault.asset().approve(address(vault), amount2);
        vault.deposit(amount2, pranker2);
        vm.stopPrank();

        assertEqDecimal(
            vault.asset().balanceOf(address(staker)), amount1 + amount2, 18,
            "Staker should have received the assets"
        );
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, 18, "Vault should have 0 assets");
        assertEqDecimal(staker.balanceOf(address(vault)), amount1 + amount2, 18, "Vault should have received the shares");
        assertEqDecimal(vault.totalAssets(), amount1 + amount2, 18, "Vault should have 0 assets");
        assertEqDecimal(vault.balanceOf(pranker1), amount1, 18, "Pranker1 should have received the shares");
        assertEqDecimal(vault.balanceOf(pranker2), amount2, 18, "Pranker2 should have received the shares");
    }
}