// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract SetOutputTokens is VaultTest {
    function test_setOutputTokens_AllowMinter() public {
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](2);
        tokens[0] = ASwapper.OutputToken(address(usdc), 5_000);
        tokens[1] = ASwapper.OutputToken(address(weth), 5_000);

        vm.prank(owner);
        vault.setOutputTokens(tokens);

        uint256 length = tokens.length;
        for (uint256 i = 0; i < length; ++i) {
            assertEq(IERC20(tokens[i].token).allowance(address(vault), address(minter)), UINT256_MAX, "allowance should be max");
        }
    }
}
