// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Redeem is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function testFuzz_redeem_ZeroAssets() public {
        vm.startPrank(alice);
        vm.expectRevert("ZERO_ASSETS");
        vault.redeem(0, alice, alice);
        vm.stopPrank();
    }

    function testFuzz_redeem_normal(uint256 amount, uint256 amount2) public {
        vm.assume(amount2 != 0);
        amount = bound(amount, amount2, UINT256_MAX);

        deal(address(staker), address(vault), amount);
        deal(address(vault.asset()), address(staker), amount);
        deal(address(vault), alice, amount2);

        vm.startPrank(alice);
        uint256 assets = vault.redeem(amount2, alice, alice);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(alice), assets, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount - assets, staker.decimals());
        assertEqDecimal(vault.balanceOf(alice), 0, vault.decimals());
        assertEqDecimal(vault.totalAssets(), amount - assets, ERC20(address(vault.asset())).decimals());
    }
}