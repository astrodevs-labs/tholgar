// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {Vault, Errors} from "../src/Vault.sol";
import {Swapper, OutputToken} from "../src/Swapper.sol";
import {WAR} from "../src/utils/constants.sol";
import {WarStaker} from "warlord/WarStaker.sol";
import {WarToken} from "warlord/WarToken.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";

contract VaultTest is Test {
    Vault vault;
    Swapper swapper;
    // doesn't fork the staker as it causes too much problem
    WarStaker staker;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);
    address public owner = vm.addr(0x3);

    function setUp() public {
        vm.startPrank(owner);
        OutputToken[] memory tokens = new OutputToken[](1);
        tokens[0] = OutputToken(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57, 1e5, 18);
        swapper = new Swapper(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57);
        swapper.setOutputTokens(tokens);
        staker = new WarStaker(WAR);
        vault = new Vault(address(staker), address(swapper), 1000, owner, WAR, WAR);
        vm.stopPrank();
    }

    function test_deploy_swapper() public {
        assertEq(vault.swapper(), address(swapper));
    }

    function test_deploy_asset() public {
        assertEq(address(vault.asset()), WAR);
    }

    function test_deploy_staker() public {
        assertEq(vault.staker(), address(staker));
        assertEq(ERC20(WAR).allowance(address(vault), address(staker)), UINT256_MAX);
    }

    function test_setSwapper_normal() public {
        OutputToken[] memory tokens = new OutputToken[](1);
        tokens[0] = OutputToken(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57, 1e5, 18);
        Swapper newSwapper = new Swapper(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57);
        newSwapper.setOutputTokens(tokens);

        vm.prank(owner);
        vault.setSwapper(address(newSwapper));
        assertEq(vault.swapper(), address(newSwapper));
    }

    function testCannot_setSwapper_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setSwapper(address(0));
    }

    function testCannot_setSwap_NotOwner() public {
        OutputToken[] memory tokens = new OutputToken[](1);
        tokens[0] = OutputToken(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57, 1e5, 18);
        Swapper newSwapper = new Swapper(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57);
        newSwapper.setOutputTokens(tokens);

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setSwapper(address(newSwapper));
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

    function testCannot_setStaker_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setStaker(address(0));
    }

    function test_setStaker_NotOwner() public {
        WarStaker newStaker = new WarStaker(WAR);

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setStaker(address(newStaker));
    }

    function testFuzz_setStaker_normal(uint256 amount) public {
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

    function testFuzz_totalAssets_normal(uint256 amount) public {
        deal(address(staker), address(vault), amount);

        assertEq(vault.totalAssets(), amount);
    }

    function testCannot_deposit_ZeroShares() public {
        vm.startPrank(alice);
        vm.expectRevert("ZERO_SHARES");
        vault.deposit(0, alice);
        vm.stopPrank();
    }

    function testFuzz_deposit_normal(uint256 amount) public {
        vm.assume(amount != 0);
        deal(WAR, alice, amount);

        vm.startPrank(alice);
        ERC20(WAR).approve(address(vault), amount);
        vault.deposit(amount, alice);
        vm.stopPrank();

        assertEq(ERC20(WAR).balanceOf(address(staker)), amount);
        assertEq(ERC20(WAR).balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), amount);
        assertEq(vault.totalAssets(), amount);
        assertEq(vault.balanceOf(alice), amount);
    }

    function testFuzz_deposit_multiple(uint256 amount1, uint256 amount2) public {
        vm.assume(amount1 != 0);
        vm.assume(amount2 != 0);
        vm.assume(amount1 < 3000 ether);
        vm.assume(amount2 < 3000 ether);

        deal(WAR, alice, amount1);
        deal(WAR, bernard, amount2);

        vm.startPrank(alice);
        ERC20(WAR).approve(address(vault), amount1);
        vault.deposit(amount1, alice);
        vm.stopPrank();

        vm.startPrank(bernard);
        ERC20(WAR).approve(address(vault), amount2);
        vault.deposit(amount2, bernard);
        vm.stopPrank();

        assertEq(ERC20(WAR).balanceOf(address(staker)), amount1 + amount2);
        assertEq(ERC20(WAR).balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), amount1 + amount2);
        assertEq(vault.totalAssets(), amount1 + amount2);
        assertEq(vault.balanceOf(alice), amount1);
        assertEq(vault.balanceOf(bernard), amount2);
    }

    function testFuzz_mint_normal(uint256 amount) public {
        vm.assume(amount != 0);

        uint256 assets = vault.convertToAssets(amount);
        deal(WAR, alice, assets);

        vm.startPrank(alice);
        ERC20(WAR).approve(address(vault), assets);
        vault.mint(amount, alice);
        vm.stopPrank();

        assertEq(ERC20(WAR).balanceOf(address(staker)), amount);
        assertEq(ERC20(WAR).balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), amount);
        assertEq(vault.totalAssets(), assets);
        assertEq(vault.balanceOf(alice), amount);
    }

    function testFuzz_mint_multiple(uint256 amount1, uint256 amount2) public {
        vm.assume(amount1 != 0);
        vm.assume(amount2 != 0);
        vm.assume(amount1 < 3000 ether);
        vm.assume(amount2 < 3000 ether);

        uint256 assets1 = vault.convertToAssets(amount1);
        uint256 assets2 = vault.convertToAssets(amount2);
        deal(WAR, alice, assets1);
        deal(WAR, bernard, assets2);

        vm.startPrank(alice);
        ERC20(WAR).approve(address(vault), assets1);
        vault.mint(amount1, alice);
        vm.stopPrank();

        vm.startPrank(bernard);
        ERC20(WAR).approve(address(vault), assets2);
        vault.mint(amount2, bernard);
        vm.stopPrank();

        assertEq(ERC20(WAR).balanceOf(address(staker)), amount1 + amount2);
        assertEq(ERC20(WAR).balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), amount1 + amount2);
        assertEq(vault.totalAssets(), assets1 + assets2);
        assertEq(vault.balanceOf(alice), amount1);
        assertEq(vault.balanceOf(bernard), amount2);
    }

    function test_redeem_ZeroAssets() public {
        vm.startPrank(alice);
        vm.expectRevert("ZERO_ASSETS");
        vault.redeem(0, alice, alice);
        vm.stopPrank();
    }

    function testFuzz_redeem_normal(uint256 amount, uint256 amount2) public {
        vm.assume(amount2 != 0);
        vm.assume(amount > amount2);

        deal(address(staker), address(vault), amount);
        deal(WAR, address(staker), amount);
        deal(address(vault), alice, amount2);

        vm.startPrank(alice);
        uint256 assets = vault.redeem(amount2, alice, alice);
        vm.stopPrank();

        assertEq(ERC20(WAR).balanceOf(alice), assets);
        assertEq(staker.balanceOf(address(vault)), amount - assets);
        assertEq(vault.balanceOf(alice), 0);
        assertEq(vault.totalAssets(), amount - assets);
    }

    function testFuzz_withdraw_normal(uint256 amount, uint256 amount2) public {
        vm.assume(amount2 != 0);
        vm.assume(amount > amount2);

        deal(address(staker), address(vault), amount);
        deal(WAR, address(staker), amount);
        deal(address(vault), alice, amount2);

        uint256 assets = vault.convertToAssets(amount2);

        vm.startPrank(alice);
        vault.withdraw(assets, alice, alice);
        vm.stopPrank();

        assertEq(ERC20(WAR).balanceOf(alice), assets);
        assertEq(staker.balanceOf(address(vault)), amount - assets);
        assertEq(vault.balanceOf(alice), 0);
        assertEq(vault.totalAssets(), amount - assets);
    }
}
