// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {Vault, Errors} from "../src/Vault.sol";
import {WAR, USDC, AUGUSTUS_SWAPPER, MINTER} from "./utils/constants.sol";
import {WarStaker} from "warlord/WarStaker.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {ASwapper} from "../src/abstracts/ASwapper.sol";

contract VaultTest is Test {
    Vault vault;
    // doesn't fork the staker as it causes too much problem
    WarStaker staker;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);
    address public owner = vm.addr(0x3);
    address public gelatoSender = vm.addr(0x4);

    function setUp() public {
        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(USDC, 18, 10_000);
        staker = new WarStaker(WAR);
        vault = new Vault(address(staker), MINTER, 500, owner, USDC, AUGUSTUS_SWAPPER, gelatoSender, WAR);
        vault.setOutputTokens(tokens);
        vm.stopPrank();
    }

    function test_deploy_harvestFee() public {
        assertEq(vault.harvestFee(), 500);
    }

    function test_deploy_feeRecipient() public {
        assertEq(vault.feeRecipient(), owner);
    }

    function test_deploy_feeToken() public {
        assertEq(address(vault.feeToken()), USDC);
    }

    function test_deploy_paused() public {
        assertEq(vault.paused(), false);
    }

    function test_deploy_owner() public {
        assertEq(vault.owner(), owner);
    }

    function test_deploy_asset() public {
        assertEq(address(vault.asset()), WAR);
    }

    function test_deploy_staker() public {
        assertEq(vault.staker(), address(staker));
        assertEq(vault.asset().allowance(address(vault), address(staker)), UINT256_MAX);
    }

    function test_setHarvestFee_normal() public {
        vm.prank(owner);
        vault.setHarvestFee(100);
        assertEq(vault.harvestFee(), 100);
    }

    function testCannot_setHarvestFee_NotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setHarvestFee(100);
    }

    function testCannot_setHarvestFee_InvalidFee() public {
        vm.expectRevert(Errors.InvalidFee.selector);
        vm.prank(owner);
        vault.setHarvestFee(10001);
    }

    function test_setFeeRecipient_normal() public {
        vm.prank(owner);
        vault.setFeeRecipient(alice);
        assertEq(vault.feeRecipient(), alice);
    }

    function testCannot_setFeeRecipient_NotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setFeeRecipient(alice);
    }

    function testCannot_setFeeRecipient_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setFeeRecipient(address(0));
    }

    function test_setFeeToken_normal() public {
        vm.prank(owner);
        vault.setFeeToken(USDC);
        assertEq(address(vault.feeToken()), USDC);
    }

    function testCannot_setFeeToken_NotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setFeeToken(USDC);
    }

    function testCannot_setFeeToken_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setFeeToken(address(0));
    }

    function test_setStaker_ZeroBalance() public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        vm.prank(owner);
        vault.setStaker(address(newStaker));

        assertEq(vault.staker(), address(newStaker));
        assertEq(vault.asset().balanceOf(address(vault)), 0);
        assertEq(newStaker.balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), 0);
        assertEq(vault.asset().allowance(address(vault), address(newStaker)), UINT256_MAX);
        assertEq(vault.asset().allowance(address(vault), address(staker)), 0);
    }

    function testCannot_setStaker_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setStaker(address(0));
    }

    function test_setStaker_NotOwner() public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(alice);
        vault.setStaker(address(newStaker));
    }

    function testFuzz_setStaker_normal(uint256 amount) public {
        WarStaker newStaker = new WarStaker(address(vault.asset()));

        deal(address(vault.asset()), address(staker), amount);
        deal(address(staker), address(vault), amount);

        vm.prank(owner);
        vault.setStaker(address(newStaker));

        assertEq(vault.staker(), address(newStaker));
        assertEq(vault.asset().balanceOf(address(vault)), 0);
        assertEq(newStaker.balanceOf(address(vault)), amount);
        assertEq(staker.balanceOf(address(vault)), 0);
        assertEq(vault.asset().allowance(address(vault), address(newStaker)), UINT256_MAX);
        assertEq(vault.asset().allowance(address(vault), address(staker)), 0);
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
        deal(address(vault.asset()), alice, amount);

        vm.startPrank(alice);
        vault.asset().approve(address(vault), amount);
        vault.deposit(amount, alice);
        vm.stopPrank();

        assertEq(vault.asset().balanceOf(address(staker)), amount);
        assertEq(vault.asset().balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), amount);
        assertEq(vault.totalAssets(), amount);
        assertEq(vault.balanceOf(alice), amount);
    }

    function testFuzz_deposit_multiple(uint256 amount1, uint256 amount2) public {
        vm.assume(amount1 != 0);
        vm.assume(amount2 != 0);
        vm.assume(amount1 < 3000 ether);
        vm.assume(amount2 < 3000 ether);

        deal(address(vault.asset()), alice, amount1);
        deal(address(vault.asset()), bernard, amount2);

        vm.startPrank(alice);
        vault.asset().approve(address(vault), amount1);
        vault.deposit(amount1, alice);
        vm.stopPrank();

        vm.startPrank(bernard);
        vault.asset().approve(address(vault), amount2);
        vault.deposit(amount2, bernard);
        vm.stopPrank();

        assertEq(vault.asset().balanceOf(address(staker)), amount1 + amount2);
        assertEq(vault.asset().balanceOf(address(vault)), 0);
        assertEq(staker.balanceOf(address(vault)), amount1 + amount2);
        assertEq(vault.totalAssets(), amount1 + amount2);
        assertEq(vault.balanceOf(alice), amount1);
        assertEq(vault.balanceOf(bernard), amount2);
    }

    function testFuzz_mint_normal(uint256 amount) public {
        vm.assume(amount != 0);

        uint256 assets = vault.convertToAssets(amount);
        deal(address(vault.asset()), alice, assets);

        vm.startPrank(alice);
        vault.asset().approve(address(vault), assets);
        vault.mint(amount, alice);
        vm.stopPrank();

        assertEq(vault.asset().balanceOf(address(staker)), amount);
        assertEq(vault.asset().balanceOf(address(vault)), 0);
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
        deal(address(vault.asset()), alice, assets1);
        deal(address(vault.asset()), bernard, assets2);

        vm.startPrank(alice);
        vault.asset().approve(address(vault), assets1);
        vault.mint(amount1, alice);
        vm.stopPrank();

        vm.startPrank(bernard);
        vault.asset().approve(address(vault), assets2);
        vault.mint(amount2, bernard);
        vm.stopPrank();

        assertEq(vault.asset().balanceOf(address(staker)), amount1 + amount2);
        assertEq(vault.asset().balanceOf(address(vault)), 0);
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
        deal(address(vault.asset()), address(staker), amount);
        deal(address(vault), alice, amount2);

        vm.startPrank(alice);
        uint256 assets = vault.redeem(amount2, alice, alice);
        vm.stopPrank();

        assertEq(vault.asset().balanceOf(alice), assets);
        assertEq(staker.balanceOf(address(vault)), amount - assets);
        assertEq(vault.balanceOf(alice), 0);
        assertEq(vault.totalAssets(), amount - assets);
    }

    function testFuzz_withdraw_normal(uint256 amount, uint256 amount2) public {
        vm.assume(amount2 != 0);
        vm.assume(amount > amount2);

        deal(address(staker), address(vault), amount);
        deal(address(vault.asset()), address(staker), amount);
        deal(address(vault), alice, amount2);

        uint256 assets = vault.convertToAssets(amount2);

        vm.startPrank(alice);
        vault.withdraw(assets, alice, alice);
        vm.stopPrank();

        assertEq(vault.asset().balanceOf(alice), assets);
        assertEq(staker.balanceOf(address(vault)), amount - assets);
        assertEq(vault.balanceOf(alice), 0);
        assertEq(vault.totalAssets(), amount - assets);
    }

    function testFuzz_recoverERC20_normal(uint256 amount) public {
        vm.assume(amount != 0);

        deal(USDC, address(vault), amount);

        vm.prank(owner);
        vault.recoverERC20(USDC);
        assertEq(ERC20(USDC).balanceOf(owner), amount);
    }

    function testCannot_recoverERC20_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroAddress.selector);
        vault.recoverERC20(address(0));
    }

    function testCannot_recoverERC20_ZeroValue() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroValue.selector);
        vault.recoverERC20(USDC);
    }

    function testCannot_recoverERC20_NotOwner() public {
        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.recoverERC20(USDC);
    }

    function test_pause_normal() public {
        vm.prank(owner);
        vault.pause();
        assertEq(vault.paused(), true);
    }

    function testCannot_pause_NotOwner() public {
        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.pause();
    }

    function test_unpause_normal() public {
        vm.startPrank(owner);
        vault.pause();
        vault.unpause();
        vm.stopPrank();
        assertEq(vault.paused(), false);
    }

    function testCannot_unpause_NotOwner() public {
        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.unpause();
    }

    /*
    function setUp() public {
        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57, 1e5, 18);
        swapper = new ASwapper(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57);
        vm.stopPrank();
    }

    function test_deploy_swapRouter() public {
        assertEq(swapper.swapRouter(), address(0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57));
    }

    function test_setSwapRouter_normal() public {
        vm.prank(owner);
        swapper.setSwapRouter(vm.addr(0x4));
        assert(swapper.swapRouter() == vm.addr(0x4));
    }

    function testCannot_setSwapRouter_zeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        swapper.setSwapRouter(vm.addr(0x4));
    }

    function testCannot_setSwapRouter_notOwner() public {

    }

    function test_setOutputTokens_normal() public {

    }

    function testCannot_setOutputTokens_noTokens() public {

    }

    function testCannot_setOutputTokens_exceedsWeight() public {

    }*/
}
