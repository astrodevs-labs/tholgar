// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapperTest.sol";

contract ZapEtherToSingleToken is ZapperTest {
    function test_zapEtherToSingleToken_Normal(uint256 etherAmount, uint256 tokenAmount, bool tokenSeed) public {
        etherAmount = bound(etherAmount, 1e18, 3000e18);
        tokenAmount = bound(tokenAmount, 1e18, 3000e18);

        bytes memory data = "";

        uint256 stakerBalance = staker.balanceOf(address(vault));

        address token = tokenSeed ? address(aura) : address(cvx);
        deal(address(token), address(zapper), tokenAmount);
        deal(alice, etherAmount);

        uint256 expectedMintedAmount = ratios.getMintAmount(token, tokenAmount);
        uint256 expectedShares = vault.previewDeposit(expectedMintedAmount);

        vm.prank(alice);
        zapper.zapEtherToSingleToken{ value: etherAmount }(address(token), alice, data);

        assertEqDecimal(IERC20(token).balanceOf(address(zapper)), 0, 18, "Vault should have no AURA");
        assertEqDecimal(
            staker.balanceOf(address(vault)),
            stakerBalance + expectedMintedAmount,
            18,
            "Vault should have same staker balance"
        );
        assertEqDecimal(vault.balanceOf(alice), expectedShares, 18, "Alice should have expected shares");
    }

    function test_zapEtherToSingleToken_ZeroValue(bool tokenSeed) public {
        bytes memory data = "";
        address token = tokenSeed ? address(aura) : address(cvx);

        vm.prank(alice);
        vm.expectRevert(Errors.ZeroValue.selector);
        zapper.zapEtherToSingleToken{ value: 0 }(address(token), alice, data);
    }
}
