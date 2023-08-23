// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract SetMinter is VaultTest {
    function test_setMinter_Normal(address newMinter) public {
        vm.assume(newMinter != address(0));

        vm.expectEmit(true, true, false, true);
        emit MinterUpdated(vault.minter(), newMinter);

        vm.prank(owner);
        vault.setMinter(newMinter);

        assertEq(vault.minter(), newMinter, "Minter should be newMinter");
    }

    function test_setMinter_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroAddress.selector);
        vault.setMinter(address(0));
    }

    function test_setMinter_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("UNAUTHORIZED");
        vault.setMinter(bob);
    }
}
