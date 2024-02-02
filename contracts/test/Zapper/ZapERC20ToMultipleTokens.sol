// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapperTest.sol";

contract ZapERC20ToMultipleTokens is ZapperTest {
    function test_zapERC20ToMultipleTokens_Normal(uint256 erc20Amount, uint256[2] memory tokenAmount) public {
        erc20Amount = bound(erc20Amount, 1e18, 3000e18);
        tokenAmount[0] = bound(tokenAmount[0], 1e18, 3000e18);
        tokenAmount[1] = bound(tokenAmount[1], 1e18, 3000e18);

        bytes[] memory datas = new bytes[](2);
        address[] memory tokens = new address[](2);
        tokens[0] = address(aura);
        tokens[1] = address(cvx);

        uint256 stakerBalance = staker.balanceOf(address(vault));

        deal(address(aura), address(zapper), tokenAmount[0]);
        deal(address(cvx), address(zapper), tokenAmount[1]);
        deal(alice, erc20Amount);

        uint256 expectedMintedAmount = ratios.getMintAmount(address(aura), tokenAmount[0]) + ratios.getMintAmount(address(cvx), tokenAmount[1]);
        uint256 expectedShares = vault.previewDeposit(expectedMintedAmount);

        vm.startPrank(alice);

        usdc.approve(address(zapper), erc20Amount);
        zapper.zapERC20ToMultipleTokens(address(usdc), tokens, erc20Amount, alice, datas);

        vm.stopPrank();

        assertEqDecimal(aura.balanceOf(address(zapper)), 0, 18, "Vault should have no AURA");
        assertEqDecimal(cvx.balanceOf(address(zapper)), 0, 18, "Vault should have no CVX");
        assertEqDecimal(
            staker.balanceOf(address(vault)), stakerBalance + expectedMintedAmount, 18, "Vault should have same staker balance"
        );
        assertEqDecimal(vault.balanceOf(alice), expectedShares, 18, "Alice should have expected shares");
    }

    function test_zapERC20ToMultipleTokens_ZeroValue(bool tokenSeed) public {
        bytes[] memory datas = new bytes[](2);
        address[] memory tokens = new address[](2);
        tokens[0] = address(aura);
        tokens[1] = address(cvx);

        vm.prank(alice);
        vm.expectRevert(Errors.ZeroValue.selector);
        zapper.zapERC20ToMultipleTokens(address(usdc), tokens, 0, alice, datas);
    }
}
