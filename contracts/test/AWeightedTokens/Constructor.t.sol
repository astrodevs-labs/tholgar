// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AWeightedTokensTest.sol";

contract Constructor is AWeightedTokensTest {
    function test_constructor_Normal() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(usdc);
        tokens[1] = address(weth);
        assertEq(weightedTokens.getWeightedTokenAddresses(), tokens);
        assertEq(weightedTokens.getWeightedTokenRatio(address(usdc)), 5_000);
        assertEq(weightedTokens.getWeightedTokenRatio(address(weth)), 5_000);
        assertEq(weightedTokens.getWeightedTokenRatio(address(aura)), 0);
    }
}
