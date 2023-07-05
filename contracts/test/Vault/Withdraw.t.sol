// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract Withdraw is VaultTest {
    function test_withdraw_Paused() public {
        vm.prank(owner);
        vault.pause();
        vm.expectRevert("Pausable: paused");
        vault.withdraw(0, owner, owner);
    }

    function test_withdraw_Normal(uint256 amount1, uint256 amount2, address pranker) public {
        amount2 = bound(amount2, 1, 3000e18 - 1);
        amount1 = bound(amount1, amount2, 3000e18);
        vm.assume(pranker != address(0));
        vm.assume(pranker != owner);

        deal(address(staker), address(vault), amount1);
        deal(address(vault.asset()), address(staker), amount1);
        deal(address(vault), pranker, amount2);

        uint256 assets = vault.convertToAssets(amount2);

        vm.startPrank(pranker);
        vault.withdraw(assets, pranker, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(pranker), assets, 18, "Pranker should have received assets");
        assertEqDecimal(
            staker.balanceOf(address(vault)), amount1 - assets, 18, "Staker should have received staking tokens"
        );
        assertEqDecimal(vault.balanceOf(pranker), 0, 18, "Pranker should have no shares");
        assertEqDecimal(vault.totalAssets(), amount1 - assets, 18, "Total assets should have decreased");
    }
}
