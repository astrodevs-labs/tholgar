// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapperTest.sol";

contract ZapERC20ToSingleToken is ZapperTest {
    function test_zapERC20ToSingleToken_Normal(uint256 erc20amount, uint256 tokenAmount, bool tokenSeed) public {
        erc20amount = bound(erc20amount, 1e18, 3000e18);
        tokenAmount = bound(tokenAmount, 1e18, 3000e18);

        bytes memory data = "";

        uint256 stakerBalance = staker.balanceOf(address(vault));

        address token = tokenSeed ? address(aura) : address(cvx);
        deal(address(token), address(zapper), tokenAmount);
        deal(address(usdc), alice, erc20amount);

        uint256 expectedMintedAmount = ratios.getMintAmount(token, tokenAmount);
        uint256 expectedShares = vault.previewDeposit(expectedMintedAmount);

        vm.startPrank(alice);

        usdc.approve(address(zapper), erc20amount);
        zapper.zapERC20ToSingleToken(address(usdc), address(token), erc20amount, alice, data);

        vm.stopPrank();

        assertEqDecimal(IERC20(token).balanceOf(address(zapper)), 0, 18, "Vault should have no AURA");
        assertEqDecimal(
            staker.balanceOf(address(vault)),
            stakerBalance + expectedMintedAmount,
            18,
            "Vault should have same staker balance"
        );
        assertEqDecimal(vault.balanceOf(alice), expectedShares, 18, "Alice should have expected shares");
    }

    function test_zapERC20ToSingleToken_ZeroValue(bool tokenSeed) public {
        bytes memory data = "";
        address token = tokenSeed ? address(aura) : address(cvx);

        vm.prank(alice);
        vm.expectRevert(Errors.ZeroValue.selector);
        zapper.zapERC20ToSingleToken(address(usdc), address(token), 0, alice, data);
    }
}
