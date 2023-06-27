// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract SetStaker is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_setStaker_ZeroBalance() public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        vm.prank(owner);
        vault.setStaker(address(newStaker));

        assertEq(vault.staker(), address(newStaker));
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(newStaker.balanceOf(address(vault)), 0, newStaker.decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), 0, staker.decimals());
        assertEq(vault.asset().allowance(address(vault), address(newStaker)), UINT256_MAX);
        assertEq(vault.asset().allowance(address(vault), address(staker)), 0);
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

    function testFuzz_setStaker_normal(uint256 amount) public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        deal(address(vault.asset()), address(staker), amount);
        deal(address(staker), address(vault), amount);

        vm.prank(owner);
        vault.setStaker(address(newStaker));

        assertEq(vault.staker(), address(newStaker));
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(newStaker.balanceOf(address(vault)), amount, newStaker.decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), 0, staker.decimals());
        assertEq(vault.asset().allowance(address(vault), address(newStaker)), UINT256_MAX);
        assertEq(vault.asset().allowance(address(vault), address(staker)), 0);
    }
}