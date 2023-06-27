// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract RecoverERC20 is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function testFuzz_recoverERC20_normal(uint256 amount) public {
        vm.assume(amount != 0);

        deal(address(usdc), address(vault), amount);

        vm.prank(owner);
        vault.recoverERC20(address(usdc));
        assertEqDecimal(usdc.balanceOf(owner), amount, ERC20(address(usdc)).decimals());
    }

    function test_recoverERC20_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroAddress.selector);
        vault.recoverERC20(address(0));
    }

    function test_recoverERC20_ZeroValue() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroValue.selector);
        vault.recoverERC20(address(usdc));
    }

    function test_recoverERC20_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.recoverERC20(address(usdc));
    }
}