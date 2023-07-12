// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract SetWeightedTokens is VaultTest {
    function test_setWeightedTokens_AllowMinter() public {
        AWeightedTokens.WeightedToken[] memory tokens = new AWeightedTokens.WeightedToken[](2);
        tokens[0] = AWeightedTokens.WeightedToken(address(usdc), 5_000);
        tokens[1] = AWeightedTokens.WeightedToken(address(weth), 5_000);

        vm.prank(owner);
        vault.setWeightedTokens(tokens);

        uint256 length = tokens.length;
        for (uint256 i = 0; i < length; ++i) {
            assertEq(
                IERC20(tokens[i].token).allowance(address(vault), address(minter)),
                UINT256_MAX,
                "allowance should be max"
            );
        }
    }
}
