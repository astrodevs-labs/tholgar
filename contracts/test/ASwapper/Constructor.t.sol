// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ASwapperTest.sol";

contract Constructor is ASwapperTest {
    function test_constructor_Normal() public {
        assertEq(swapper.swapRouter(), augustusSwapper, "SwapRouter should be augustusSwapper");
        assertEq(
            swapper.tokenTransferAddress(), tokenTransferAddress, "TokenTransferAddress should be tokenTransferAddress"
        );
        address[] memory tokens = new address[](2);
        tokens[0] = address(usdc);
        tokens[1] = address(weth);
        assertEq(swapper.getOutputTokenAddresses(), tokens);
        assertEq(swapper.getOutputTokenRatio(address(usdc)), 5_000);
        assertEq(swapper.getOutputTokenRatio(address(weth)), 5_000);
        assertEq(swapper.getOutputTokenRatio(address(aura)), 0);
    }

    function test_constructor_ZeroAddressSwapRouter() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new ASwapperMock(address(0), tokenTransferAddress);
    }

    function test_constructor_ZeroAddressTokenTransferAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new ASwapperMock(augustusSwapper, address(0));
    }
}
