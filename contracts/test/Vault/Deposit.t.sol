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

/*
    TODO @0xtekgrinder
    function testFuzz_deposit_normal() public {
        deal(address(vault.asset()), alice, 10);

        vm.startPrank(alice);
        vault.asset().approve(address(vault), 10);
        vault.deposit(10, alice);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(address(staker)), 10, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), 10, staker.decimals());
        assertEqDecimal(vault.totalAssets(), 10, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(alice), 10, vault.decimals());
    }

    function testFuzz_deposit_multiple(uint256 amount1, uint256 amount2, address pranker1, address pranker2) public {
        amount1 = bound(amount1, 1, 3000 ether);
        amount2 = bound(amount2, 1, 3000 ether);
        vm.assume(pranker1 != owner);
        vm.assume(pranker2 != owner);

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
            vault.asset().balanceOf(address(staker)), amount1 + amount2, ERC20(address(vault.asset())).decimals()
        );
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount1 + amount2, staker.decimals());
        assertEqDecimal(vault.totalAssets(), amount1 + amount2, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(pranker1), amount1, vault.decimals());
        assertEqDecimal(vault.balanceOf(pranker2), amount2, vault.decimals());
    }
*/
}