// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {Swap} from "../src/Swap.sol";
import {ISwap} from "../src/interfaces/ISwap.sol";
import {STAKER, WAR} from "../src/utils/constants.sol";
import {WarStaker} from "warlord/WarStaker.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract VaultTest is Test {
    Vault vault;
    Swap swap;
    // doesn't fork the staker as it causes too much problem
    WarStaker staker;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);
    address public owner = vm.addr(0x3);

    function setUp() public {
        vm.startPrank(owner);
        swap = new Swap();
        staker = new WarStaker(WAR);
        vault = new Vault(address(staker), address(swap), WAR);
        vm.stopPrank();
    }

    function test_deploy_swap() public {
        assertEq(vault.swap(), address(swap));
    }

    function test_deploy_asset() public {
        assertEq(address(vault.asset()), WAR);
    }

    function test_deploy_staker() public {
        assertEq(vault.staker(), address(staker));
        assertEq(ERC20(WAR).allowance(address(vault), address(staker)), UINT256_MAX);
    }

    function test_setSwap_normal() public {
        Swap newSwap = new Swap();

        vm.prank(owner);
        vault.setSwap(address(newSwap));
        assertEq(vault.swap(), address(newSwap));
    }

    function testCannot_setSwap_NotOwner() public {
        Swap newSwap = new Swap();

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setSwap(address(newSwap));
    }

    function test_setStaker_ZeroBalance() public {
        WarStaker newStaker = new WarStaker(WAR);

        vm.prank(owner);
        vault.setStaker(address(newStaker));
        assertEq(vault.staker(), address(newStaker));
        assertEq(ERC20(WAR).balanceOf(address(vault)), 0);
        assertEq(newStaker.balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), 0);
        assertEq(ERC20(WAR).allowance(address(vault), address(newStaker)), UINT256_MAX);
        assertEq(ERC20(WAR).allowance(address(vault), address(staker)), 0);
    }

    function test_setStaker_NotOwner() public {
        WarStaker newStaker = new WarStaker(WAR);

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setStaker(address(newStaker));
    }

    function testFuzz_setStaker_normal(uint256 amount) public {
        vm.assume(amount < type(uint256).max);
        WarStaker newStaker = new WarStaker(WAR);

        deal(WAR, address(staker), amount);
        deal(address(staker), address(vault), amount);

        vm.prank(owner);
        vault.setStaker(address(newStaker));
        assertEq(vault.staker(), address(newStaker));
        assertEq(ERC20(WAR).balanceOf(address(vault)), 0);
        assertEq(newStaker.balanceOf(address(vault)), amount);
        assertEq(staker.balanceOf(address(vault)), 0);
        assertEq(ERC20(WAR).allowance(address(vault), address(newStaker)), UINT256_MAX);
        assertEq(ERC20(WAR).allowance(address(vault), address(staker)), 0);
    }
}
