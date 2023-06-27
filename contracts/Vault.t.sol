// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {WarStaker} from "warlord/Staker.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {ASwapper} from "../src/abstracts/ASwapper.sol";
import {Errors} from "../src/utils/Errors.sol";
import {AutoCompounderTest} from "./utils/AutoCompounderTest.sol";

contract VaultTest is AutoCompounderTest {
    Vault vault;
    // doesn't fork the staker as it causes too much problem
    WarStaker staker;

    address public gelatoSender = makeAddr("gelatoSender");

    function setUp() public override {
        super.setUp();

        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(USDC, 18, 10_000);
        staker = new WarStaker(WAR);
        vault = new Vault(address(staker), MINTER, 500, owner, USDC, AUGUSTUS_SWAPPER, gelatoSender, WAR);
        vault.setOutputTokens(tokens);
        vm.stopPrank();
    }



    function test_pause_normal() public {
        vm.prank(owner);
        vault.pause();
        assertTrue(vault.paused());
    }

    function testFuzz_pause_NotOwner(address pranker) public {
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

    function testFuzz_unpause_NotOwner(address pranker) public {
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

    } */
}
