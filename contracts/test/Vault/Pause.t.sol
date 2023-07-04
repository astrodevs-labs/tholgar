// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract Pause is VaultTest {
    function test_pause_Normal() public {
        vm.prank(owner);
        vault.pause();
        assertTrue(vault.paused(), "Vault should be paused");
    }

    function test_pause_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.pause();
    }
}
