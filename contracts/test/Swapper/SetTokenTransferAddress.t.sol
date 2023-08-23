// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./SwapperTest.sol";

contract SetTokenTransferAddress is SwapperTest {
    function test_setTokenTransferAddress_Normal(address newTokenTransferAddress) public {
        vm.assume(newTokenTransferAddress != address(0));

        vm.expectEmit(true, true, false, true);
        emit TokenTransferAddressUpdated(swapper.tokenTransferAddress(), newTokenTransferAddress);

        vm.prank(owner);
        swapper.setTokenTransferAddress(newTokenTransferAddress);
        assertEq(
            swapper.tokenTransferAddress(),
            newTokenTransferAddress,
            "tokenTransferAddress should be newTokenTransferAddress"
        );
    }

    function test_setTokenTransferAddress_NotOwner(address newTokenTransferAddress) public {
        vm.assume(newTokenTransferAddress != address(0));

        vm.prank(alice);
        vm.expectRevert("UNAUTHORIZED");
        swapper.setTokenTransferAddress(newTokenTransferAddress);
    }

    function test_setTokenTransferAddress_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        swapper.setTokenTransferAddress(address(0));
    }
}
