// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract Compound is VaultTest {
    function test_compound_NotOwnerOrOperator() public {
        bytes[] memory data = new bytes[](2);
        address[] memory tokens = new address[](2);

        tokens[0] = vault.feeToken();
        tokens[1] = vault.feeToken();

        vm.prank(bob);
        vm.expectRevert(Errors.NotOperatorOrOwner.selector);
        vault.compound(tokens, data);
    }

    function test_compound_Normal(uint256 amount1, uint256 amount2, uint256 amount3) public {
        amount1 = bound(amount1, 1e18, 3000e18);
        amount2 = bound(amount2, 1e18, 3000e18);
        amount3 = bound(amount3, 1e18, 3000e18);

        bytes[] memory data = new bytes[](2);
        address[] memory tokens = new address[](2);

        tokens[0] = vault.feeToken();
        tokens[1] = vault.feeToken();

        uint256 stakerBalance = staker.balanceOf(address(vault));

        deal(address(aura), address(vault), amount1);
        deal(address(cvx), address(vault), amount2);
        deal(address(vault.feeToken()), address(vault), amount3);

        uint256 expectedMintedAmount =
            stakerBalance + ratios.getMintAmount(address(aura), amount1) + ratios.getMintAmount(address(cvx), amount2);

        vm.expectEmit(true, false, false, true);
        emit Compounded(expectedMintedAmount);

        vm.prank(owner);
        vault.compound(tokens, data);

        assertEqDecimal(aura.balanceOf(address(vault)), 0, 18, "Vault should have no AURA");
        assertEqDecimal(cvx.balanceOf(address(vault)), 0, 18, "Vault should have no CVX");
        assertEqDecimal(
            staker.balanceOf(address(vault)), expectedMintedAmount, 18, "Vault should have same staker balance"
        );
        assertEqDecimal(usdc.balanceOf(address(vault)), 0, 6, "Vault should have no USDC");
        assertEqDecimal(usdc.balanceOf(address(swapper)), amount3, 6, "Swapper should have all USDC");
    }
}
