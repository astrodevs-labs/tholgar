// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Unpause is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function test_unpause_normal() public {
        vm.startPrank(owner);
        vault.pause();
        vault.unpause();
        vm.stopPrank();
        assertFalse(vault.paused());
    }

    function test_unpause_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.unpause();
    }
}