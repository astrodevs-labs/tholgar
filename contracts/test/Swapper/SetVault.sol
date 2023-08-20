// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./SwapperTest.sol";

contract SetVault is SwapperTest {
    function test_setVault_Normal(address newVault) public {
        vm.assume(newVault != address(0));

        vm.expectEmit(true, true, false, true);
        emit VaultUpdated(swapper.vault(), newVault);

        vm.prank(owner);
        swapper.setVault(newVault);
        assertEq(swapper.vault(), newVault, "vault should be newVault");
    }

    function test_setVault_NotOwner(address newVault) public {
        vm.assume(newVault != address(0));

        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        swapper.setVault(newVault);
    }

    function test_setVault_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        swapper.setVault(address(0));
    }
}
