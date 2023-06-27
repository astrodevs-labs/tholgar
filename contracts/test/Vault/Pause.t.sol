// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract Pause is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

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