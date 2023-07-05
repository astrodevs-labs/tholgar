// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract SetStaker is VaultTest {
    function test_setStaker_ZeroBalance() public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        vm.expectEmit(true, true, false, true);
        emit StakerUpdated(vault.staker(), address(newStaker));
        vm.prank(owner);
        vault.setStaker(address(newStaker));

        assertEq(vault.staker(), address(newStaker), "Staker should be newStaker");
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, 18, "Vault should have 0 assets");
        assertEqDecimal(newStaker.balanceOf(address(vault)), 0, 18, "newStaker should have 0 assets");
        assertEqDecimal(staker.balanceOf(address(vault)), 0, 18, "staker should have 0 assets");
        assertEq(
            vault.asset().allowance(address(vault), address(newStaker)),
            UINT256_MAX,
            "newStaker should have unlimited allowance"
        );
        assertEq(vault.asset().allowance(address(vault), address(staker)), 0, "staker should have 0 allowance");
    }

    function test_setStaker_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setStaker(address(0));
    }

    function test_setStaker_NotOwner() public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(bob);
        vault.setStaker(address(newStaker));
    }

    function test_setStaker_Normal(uint256 amount) public {
        amount = bound(amount, 1, 3000e18);

        WarStaker newStaker = new WarStaker(address(vault.asset()));

        deal(address(vault.asset()), address(staker), amount);
        deal(address(staker), address(vault), amount);

        vm.expectEmit(true, true, false, true);
        emit StakerUpdated(vault.staker(), address(newStaker));
        vm.prank(owner);
        vault.setStaker(address(newStaker));

        assertEq(vault.staker(), address(newStaker), "Staker should be newStaker");
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, 18, "Vault should have 0 assets");
        assertEqDecimal(newStaker.balanceOf(address(vault)), amount, 18, "newStaker should have all assets");
        assertEqDecimal(staker.balanceOf(address(vault)), 0, 18, "staker should have 0 assets");
        assertEq(
            vault.asset().allowance(address(vault), address(newStaker)),
            UINT256_MAX,
            "newStaker should have unlimited allowance"
        );
        assertEq(vault.asset().allowance(address(vault), address(staker)), 0, "staker should have 0 allowance");
    }
}
