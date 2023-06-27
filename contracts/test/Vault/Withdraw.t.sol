// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Withdraw is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

/*
    TODO: @0xtekgrinder
    function testFuzz_withdraw_normal(uint256 amount, uint256 amount2, address pranker) public {
        vm.assume(amount2 != 0);
        amount = bound(amount, amount2, UINT256_MAX);

        deal(address(staker), address(vault), amount);
        deal(address(vault.asset()), address(staker), amount);
        deal(address(vault), pranker, amount2);

        uint256 assets = vault.convertToAssets(amount2);

        vm.startPrank(pranker);
        vault.withdraw(assets, pranker, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(pranker), assets, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount - assets, staker.decimals());
        assertEqDecimal(vault.balanceOf(pranker), 0, vault.decimals());
        assertEqDecimal(vault.totalAssets(), amount - assets, ERC20(address(vault.asset())).decimals());
    }
*/
}