// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./SwapperTest.sol";

contract Swap is SwapperTest {
    function test_swap_Normal() public {
        address[] memory tokens = new address[](1);
        bytes[] memory data = new bytes[](1);

        tokens[0] = address(usdc);

        vm.prank(vault);
        vm.expectCall(augustusSwapper, "");
        swapper.swap(tokens, data);

        assertEq(usdc.allowance(address(swapper), address(swapper.tokenTransferAddress())), UINT256_MAX);
    }

    function test_swap_NoTokens() public {
        address[] memory tokens = new address[](0);
        bytes[] memory data = new bytes[](0);

        vm.prank(vault);
        swapper.swap(tokens, data);
    }

    function test_swap_AlreadyAllowance() public {
        address[] memory tokens = new address[](1);
        bytes[] memory data = new bytes[](1);

        tokens[0] = address(usdc);

        vm.prank(address(swapper));
        usdc.approve(address(swapper.tokenTransferAddress()), UINT256_MAX);

        vm.prank(vault);
        vm.expectCall(augustusSwapper, "");
        swapper.swap(tokens, data);

        assertEq(usdc.allowance(address(swapper), address(swapper.tokenTransferAddress())), UINT256_MAX);
    }

    function test_swap_RevertWithoutMessage() public {
        address[] memory tokens = new address[](1);
        bytes[] memory data = new bytes[](1);

        tokens[0] = address(usdc);

        vm.mockCallRevert(augustusSwapper, "", "");

        vm.prank(vault);
        vm.expectRevert(Errors.SwapError.selector);
        swapper.swap(tokens, data);
    }

    function test_swap_RevertWithMessage() public {
        address[] memory tokens = new address[](1);
        bytes[] memory data = new bytes[](1);

        tokens[0] = address(usdc);

        vm.mockCallRevert(augustusSwapper, "", "Swap failed");

        vm.prank(vault);
        vm.expectRevert("Swap failed");
        swapper.swap(tokens, data);
    }
}
