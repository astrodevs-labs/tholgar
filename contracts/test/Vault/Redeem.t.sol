// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Redeem is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_redeem_ZeroAssets() public {
        vm.startPrank(alice);
        vm.expectRevert("ZERO_ASSETS");
        vault.redeem(0, alice, alice);
        vm.stopPrank();
    }

    function testFuzz_redeem_Normal(uint256 amount1, uint256 amount2, address pranker) public {
        amount2 = bound(amount2, 1, 3000 ether - 1);
        amount1 = bound(amount1, amount2, 3000 ether);
        vm.assume(pranker != address(0));
        vm.assume(pranker != owner);

        deal(address(staker), address(vault), amount1);
        deal(address(vault.asset()), address(staker), amount1);
        deal(address(vault), pranker, amount2);

        vm.startPrank(pranker);
        uint256 assets = vault.redeem(amount2, pranker, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(pranker), assets, 18, "Pranker should have received assets");
        assertEqDecimal(
            staker.balanceOf(address(vault)), amount1 - assets, 18, "Staker should have received staking tokens"
        );
        assertEqDecimal(vault.balanceOf(pranker), 0, 18, "Pranker should have no shares");
        assertEqDecimal(vault.totalAssets(), amount1 - assets, 18, "Total assets should have decreased");
    }
}
