// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract SetSwapper is VaultTest {
    function test_setSwapper_Normal(address newSwapper) public {
        vm.assume(newSwapper != address(0));

        vm.expectEmit(true, true, false, true);
        emit SwapperUpdated(vault.swapper(), newSwapper);

        vm.prank(owner);
        vault.setSwapper(newSwapper);

        assertEq(vault.swapper(), newSwapper, "Swapper should be newSwapper");
    }

    function test_setSwapper_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroAddress.selector);
        vault.setSwapper(address(0));
    }

    function test_setSwapper_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setSwapper(bob);
    }
}
