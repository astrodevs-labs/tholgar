// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {AWeightedTokensMock, AWeightedTokens} from "../mock/AWeightedTokens.sol";

contract AWeightedTokensTest is MainnetTest {
    AWeightedTokensMock weightedTokens;

    event WeightedTokensUpdated(AWeightedTokens.WeightedToken[] tokens);

    function setUp() public virtual override {
        vm.startPrank(owner);

        weightedTokens = new AWeightedTokensMock();
        AWeightedTokens.WeightedToken[] memory tokens = new AWeightedTokens.WeightedToken[](2);
        tokens[0] = AWeightedTokens.WeightedToken(address(usdc), 5_000);
        tokens[1] = AWeightedTokens.WeightedToken(address(weth), 5_000);
        weightedTokens.setWeightedTokens(tokens);

        vm.stopPrank();
    }
}
