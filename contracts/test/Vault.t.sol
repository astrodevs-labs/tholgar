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

    address public owner = vm.addr(0x1);
    address public gelatoSender = vm.addr(0x2);

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
        assertEqDecimal(vault.harvestFee(), 500, 2);
    }

    function test_deploy_feeRecipient() public {
        assertEq(vault.feeRecipient(), owner);
    }

    function test_deploy_feeToken() public {
        assertEq(address(vault.feeToken()), USDC);
    }

    function test_deploy_paused() public {
        assertFalse(vault.paused());
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

    function test_setHarvestFee_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(pranker);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setHarvestFee(100);
    }

    function testFuzz_setHarvestFee_InvalidFee(uint256 amount) public {
        amount = bound(amount, 10001, UINT256_MAX);

        vm.expectRevert(Errors.InvalidFee.selector);
        vm.prank(owner);
        vault.setHarvestFee(10001);
    }

    function test_setFeeRecipient_normal(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(owner);
        vault.setFeeRecipient(pranker);
        assertEq(vault.feeRecipient(), pranker);
    }

    function test_setFeeRecipient_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(pranker);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setFeeRecipient(pranker);
    }

    function test_setFeeRecipient_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setFeeRecipient(address(0));
    }

    function test_setFeeToken_normal() public {
        vm.prank(owner);
        vault.setFeeToken(USDC);
        assertEq(address(vault.feeToken()), USDC);
    }

    function test_setFeeToken_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(pranker);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setFeeToken(USDC);
    }

    function test_setFeeToken_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setFeeToken(address(0));
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

    function testFuzz_setStaker_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        WarStaker newStaker = new WarStaker(address(vault.asset()));

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(pranker);
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

    function testFuzz_totalAssets_normal(uint256 amount) public {
        deal(address(staker), address(vault), amount);

        assertEqDecimal(vault.totalAssets(), amount, ERC20(address(vault.asset())).decimals());
    }

    function test_deposit_ZeroShares(address pranker) public {
        vm.assume(pranker != owner);

        vm.startPrank(pranker);
        vm.expectRevert("ZERO_SHARES");
        vault.deposit(0, pranker);
        vm.stopPrank();
    }

    function testFuzz_deposit_normal(uint256 amount, address pranker) public {
        vm.assume(amount != 0);
        vm.assume(pranker != owner);
        deal(address(vault.asset()), pranker, amount);

        vm.startPrank(pranker);
        vault.asset().approve(address(vault), amount);
        vault.deposit(amount, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(address(staker)), amount, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount, staker.decimals());
        assertEqDecimal(vault.totalAssets(), amount, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(pranker), amount, vault.decimals());
    }

    function testFuzz_deposit_multiple(uint256 amount1, uint256 amount2, address pranker1, address pranker2) public {
        amount1 = bound(amount1, 1, 3000 ether);
        amount2 = bound(amount2, 1, 3000 ether);
        vm.assume(pranker1 != owner);
        vm.assume(pranker2 != owner);

        deal(address(vault.asset()), pranker1, amount1);
        deal(address(vault.asset()), pranker2, amount2);

        vm.startPrank(pranker1);
        vault.asset().approve(address(vault), amount1);
        vault.deposit(amount1, pranker1);
        vm.stopPrank();

        vm.startPrank(pranker2);
        vault.asset().approve(address(vault), amount2);
        vault.deposit(amount2, pranker2);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(address(staker)), amount1 + amount2, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount1 + amount2, staker.decimals());
        assertEqDecimal(vault.totalAssets(), amount1 + amount2, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(pranker1), amount1, vault.decimals());
        assertEqDecimal(vault.balanceOf(pranker2), amount2, vault.decimals());
    }

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

        assertEqDecimal(vault.asset().balanceOf(address(staker)), amount1 + amount2, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.asset().balanceOf(address(vault)), 0, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount1 + amount2, staker.decimals());
        assertEqDecimal(vault.totalAssets(), assets1 + assets2, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(vault.balanceOf(pranker1), amount1, vault.decimals());
        assertEqDecimal(vault.balanceOf(pranker2), amount2, vault.decimals());
    }

    function test_redeem_ZeroAssets(address pranker) public {
        vm.assume(pranker != owner);

        vm.startPrank(pranker);
        vm.expectRevert("ZERO_ASSETS");
        vault.redeem(0, pranker, pranker);
        vm.stopPrank();
    }

    function testFuzz_redeem_normal(uint256 amount, uint256 amount2, address pranker) public {
        vm.assume(amount2 != 0);
        vm.assume(pranker != owner);
        amount = bound(amount, amount2, UINT256_MAX);

        deal(address(staker), address(vault), amount);
        deal(address(vault.asset()), address(staker), amount);
        deal(address(vault), pranker, amount2);

        vm.startPrank(pranker);
        uint256 assets = vault.redeem(amount2, pranker, pranker);
        vm.stopPrank();

        assertEqDecimal(vault.asset().balanceOf(pranker), assets, ERC20(address(vault.asset())).decimals());
        assertEqDecimal(staker.balanceOf(address(vault)), amount - assets, staker.decimals());
        assertEqDecimal(vault.balanceOf(pranker), 0, vault.decimals());
        assertEqDecimal(vault.totalAssets(), amount - assets, ERC20(address(vault.asset())).decimals());
    }

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

    function testFuzz_recoverERC20_normal(uint256 amount) public {
        vm.assume(amount != 0);

        deal(USDC, address(vault), amount);

        vm.prank(owner);
        vault.recoverERC20(USDC);
        assertEqDecimal(ERC20(USDC).balanceOf(owner), amount, ERC20(USDC).decimals());
    }

    function test_recoverERC20_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroAddress.selector);
        vault.recoverERC20(address(0));
    }

    function test_recoverERC20_ZeroValue() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroValue.selector);
        vault.recoverERC20(USDC);
    }

    function test_recoverERC20_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(pranker);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.recoverERC20(USDC);
    }

    function test_pause_normal() public {
        vm.prank(owner);
        vault.pause();
        assertTrue(vault.paused());
    }

    function test_pause_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(pranker);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.pause();
    }

    function test_unpause_normal() public {
        vm.startPrank(owner);
        vault.pause();
        vault.unpause();
        vm.stopPrank();
        assertFalse(vault.paused());
    }

    function test_unpause_NotOwner(address pranker) public {
        vm.assume(pranker != owner);

        vm.prank(pranker);
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

    function test_setSwapRouter_zeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        swapper.setSwapRouter(vm.addr(0x4));
    }

    function test_setSwapRouter_notOwner() public {

    }

    function test_setOutputTokens_normal() public {

    }

    function test_setOutputTokens_noTokens() public {

    }

    function test_setOutputTokens_exceedsWeight() public {

    }*/
}
