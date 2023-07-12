// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AWeightedTokensTest.sol";

contract SetWeightedTokens is AWeightedTokensTest {
    function _setWeightedTokens(uint256 length, address[] memory tokens, uint256[] memory amounts) private {
        AWeightedTokens.WeightedToken[] memory weightTokens = new AWeightedTokens.WeightedToken[](length);

        uint256 left = weightedTokens.MAX_WEIGHT();
        for (uint256 i = 0; i < length; ++i) {
            uint256 maxAmount = (i == length - 1) ? left : left / length - i;
            console.log(left, maxAmount);
            amounts[i] = bound(amounts[i], 1, maxAmount);
            left -= amounts[i];
            weightTokens[i] = AWeightedTokens.WeightedToken(tokens[i], amounts[i]);
        }

        vm.expectEmit(true, true, false, true);
        emit WeightedTokensUpdated(weightTokens);

        vm.prank(owner);
        weightedTokens.setWeightedTokens(weightTokens);

        assertEq(weightedTokens.getWeightedTokenAddresses(), tokens, "weightedAddresses should be the fuzzed tokens");
        for (uint256 i = 0; i < length; ++i) {
            assertEq(
                weightedTokens.getWeightedTokenRatio(tokens[i]),
                amounts[i],
                "weightedAmounts should be the fuzzed amounts"
            );
        }
    }

    function test_setWeightedTokens_Normal(uint256 seed, uint256 length) public {
        length = bound(length, 1, 10);
        address[] memory tokens = generateAddressArrayFromHash(seed, length);
        uint256[] memory amounts = generateNumberArrayFromHash(seed, length, UINT256_MAX);

        _setWeightedTokens(length, tokens, amounts);
    }

    function test_setWeightedTokens_NotWeightedTokens() public {
        vm.expectRevert(Errors.NoWeightedTokens.selector);
        vm.prank(owner);
        weightedTokens.setWeightedTokens(new AWeightedTokens.WeightedToken[](0));
    }

    function test_setWeightedTokens_RatioOverflow(uint256 seed, uint256 length) public {
        length = bound(length, 1, 10);
        console.log(length);
        address[] memory tokens = generateAddressArrayFromHash(seed, length);
        uint256[] memory amounts = generateNumberArrayFromHash(seed, length, UINT256_MAX);

        AWeightedTokens.WeightedToken[] memory weightTokens = new AWeightedTokens.WeightedToken[](length);

        uint256 max = weightedTokens.MAX_WEIGHT() + 1;
        for (uint256 i = 0; i < length; ++i) {
            amounts[i] = bound(amounts[i], max, 1e18);
            weightTokens[i] = AWeightedTokens.WeightedToken(tokens[i], amounts[i]);
        }

        vm.expectRevert(Errors.RatioOverflow.selector);
        vm.prank(owner);
        weightedTokens.setWeightedTokens(weightTokens);
    }

    function test_setWeightedTokens_BiggerArrayThenSmaller(
        uint256 seed1,
        uint256 seed2,
        uint256 length1,
        uint256 length2
    ) public {
        length1 = bound(length1, 2, 10);
        length2 = bound(length2, 1, length1);
        address[] memory tokens1 = generateAddressArrayFromHash(seed1, length1);
        uint256[] memory amounts1 = generateNumberArrayFromHash(seed1, length1, UINT256_MAX);

        _setWeightedTokens(length1, tokens1, amounts1);

        address[] memory tokens2 = generateAddressArrayFromHash(seed2, length2);
        uint256[] memory amounts2 = generateNumberArrayFromHash(seed2, length2, UINT256_MAX);

        _setWeightedTokens(length2, tokens2, amounts2);
    }
}
