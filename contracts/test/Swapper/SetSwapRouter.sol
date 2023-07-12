// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./SwapperTest.sol";

contract SetSwapRouter is SwapperTest {
    function test_setSwapRouter_Normal(address newSwapRouter) public {
        vm.assume(newSwapRouter != address(0));

        vm.expectEmit(true, true, false, true);
        emit SwapRouterUpdated(swapper.swapRouter(), newSwapRouter);

        vm.prank(owner);
        swapper.setSwapRouter(newSwapRouter);
        assertEq(swapper.swapRouter(), newSwapRouter, "swapRouter should be newSwapRouter");
    }

    function test_setSwapRouter_NotOwner(address newSwapRouter) public {
        vm.assume(newSwapRouter != address(0));

        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        swapper.setSwapRouter(newSwapRouter);
    }

    function test_setSwapRouter_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        swapper.setSwapRouter(address(0));
    }
}
