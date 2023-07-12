// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./SwapperTest.sol";

contract RecoverERC20 is SwapperTest {
    function test_recoverERC20_Normal(uint256 amount) public {
        amount = bound(amount, 1, UINT256_MAX);

        deal(address(usdc), address(swapper), amount);

        vm.prank(owner);
        swapper.recoverERC20(address(usdc));
        assertEqDecimal(usdc.balanceOf(owner), amount, 18, "Owner should have all USDC");
    }

    function test_recoverERC20_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroAddress.selector);
        swapper.recoverERC20(address(0));
    }

    function test_recoverERC20_ZeroValue() public {
        vm.prank(owner);
        vm.expectRevert(Errors.ZeroValue.selector);
        swapper.recoverERC20(address(usdc));
    }

    function test_recoverERC20_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        swapper.recoverERC20(address(usdc));
    }
}
