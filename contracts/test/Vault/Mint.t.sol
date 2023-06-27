// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Mint is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

/*
    TODO: @0xtegrinder
    function testFuzz_mint_normal(uint256 amount, address pranker) public {
        vm.assume(amount != 0);
        vm.assume(pranker != owner);

        uint256 assets = vault.convertToAssets(amount);
        deal(address(vault.asset()), pranker, assets);

        vm.startPrank(pranker);
        vault.asset().approve(address(vault), assets);
        vault.mint(amount, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(address(staker)), amount, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount, staker.decimals());
        assertEqDecimal(vault.totalAssets(), assets, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(pranker), amount, vault.decimals());
    }

    function testFuzz_mint_multiple(uint256 amount1, uint256 amount2, address pranker1, address pranker2) public {
        amount1 = bound(amount1, 1, 3000 ether);
        amount2 = bound(amount2, 1, 3000 ether);
        vm.assume(pranker1 != owner);
        vm.assume(pranker2 != owner);

        uint256 assets1 = vault.convertToAssets(amount1);
        uint256 assets2 = vault.convertToAssets(amount2);
        deal(address(vault.asset()), pranker1, assets1);
        deal(address(vault.asset()), pranker2, assets2);

        vm.startPrank(pranker1);
        vault.asset().approve(address(vault), assets1);
        vault.mint(amount1, pranker1);
        vm.stopPrank();

        vm.startPrank(pranker2);
        vault.asset().approve(address(vault), assets2);
        vault.mint(amount2, pranker2);
        vm.stopPrank();

        assertEqDecimal(
            vault.asset().balanceOf(address(staker)), amount1 + amount2, ERC20(address(vault.asset())).decimals()
        );
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount1 + amount2, staker.decimals());
        assertEqDecimal(vault.totalAssets(), assets1 + assets2, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(pranker1), amount1, vault.decimals());
        assertEqDecimal(vault.balanceOf(pranker2), amount2, vault.decimals());
    }
*/
}