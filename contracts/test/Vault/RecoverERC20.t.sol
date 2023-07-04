// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract RecoverERC20 is VaultTest {
    function test_recoverERC20_Normal(uint256 amount) public {
        amount = bound(amount, 1, UINT256_MAX);

        deal(address(usdc), address(vault), amount);

        vm.prank(owner);
        vault.recoverERC20(address(usdc));
        assertEqDecimal(usdc.balanceOf(owner), amount, 18, "Owner should have all USDC");
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
