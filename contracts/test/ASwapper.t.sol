// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {ASwapper} from "../src/abstracts/ASwapper.sol";
import {USDC} from "./utils/constants.sol";
import {Errors} from "../src/utils/Errors.sol";

contract ASwapperTest is Test {
    ASwapper swapper;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);
    address public owner = vm.addr(0x3);

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

    }
}
