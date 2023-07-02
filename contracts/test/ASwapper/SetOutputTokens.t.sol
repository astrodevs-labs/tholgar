// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ASwapperTest.sol";

contract SetOutputTokens is ASwapperTest {
    function _setOutputTokens(uint256 length, address[] memory tokens, uint256[] memory amounts) private {
        ASwapper.OutputToken[] memory outputTokens = new ASwapper.OutputToken[](length);

        uint256 left = swapper.MAX_WEIGHT();
        for (uint256 i = 0; i < length; ++i) {
            uint256 maxAmount = (i == length - 1) ? left : left / length - i;
            amounts[i] = bound(amounts[i], 1, maxAmount);
            left -= amounts[i];
            outputTokens[i] = ASwapper.OutputToken(tokens[i], amounts[i]);
        }

        vm.expectEmit(true, true, false, true);
        emit OutputTokensUpdated(outputTokens);

        vm.prank(owner);
        swapper.setOutputTokens(outputTokens);

        assertEq(swapper.getOutputTokenAddresses(), tokens, "outputAddresses should be the fuzzed tokens");
        for (uint256 i = 0; i < length; ++i) {
            assertEq(swapper.getOutputTokenRatio(tokens[i]), amounts[i], "outputAmounts should be the fuzzed amounts");
        }
    }

    function test_setOutputTokens_Normal(uint256 seed, uint256 length) public {
        length = bound(length, 1, 10);
        address[] memory tokens = generateAddressArrayFromHash(seed, length);
        uint256[] memory amounts = generateNumberArrayFromHash(seed, length, UINT256_MAX);

        _setOutputTokens(length, tokens, amounts);
    }

    function test_setOutputTokens_NotOutputTokens() public {
        vm.expectRevert(Errors.NoOutputTokens.selector);
        vm.prank(owner);
        swapper.setOutputTokens(new ASwapper.OutputToken[](0));
    }

    function test_setOutputTokens_RatioOverflow(uint256 seed, uint256 length) public {
        length = bound(length, 1, 10);
        console.log(length);
        address[] memory tokens = generateAddressArrayFromHash(seed, length);
        uint256[] memory amounts = generateNumberArrayFromHash(seed, length, UINT256_MAX);

        ASwapper.OutputToken[] memory outputTokens = new ASwapper.OutputToken[](length);

        uint256 max = swapper.MAX_WEIGHT() + 1;
        for (uint256 i = 0; i < length; ++i) {
            amounts[i] = bound(amounts[i], max, 1e18);
            outputTokens[i] = ASwapper.OutputToken(tokens[i], amounts[i]);
        }

        vm.expectRevert(Errors.RatioOverflow.selector);
        vm.prank(owner);
        swapper.setOutputTokens(outputTokens);
    }

    function test_setOutputTokens_BiggerArrayThenSmaller(uint256 seed1, uint256 seed2, uint256 length1, uint256 length2) public {
        length1 = bound(length1, 2, 10);
        length2 = bound(length2, 1, length1);
        address[] memory tokens1 = generateAddressArrayFromHash(seed1, length1);
        uint256[] memory amounts1 = generateNumberArrayFromHash(seed1, length1, UINT256_MAX);

        _setOutputTokens(length1, tokens1, amounts1);

        address[] memory tokens2 = generateAddressArrayFromHash(seed2, length2);
        uint256[] memory amounts2 = generateNumberArrayFromHash(seed2, length2, UINT256_MAX);

        _setOutputTokens(length2, tokens2, amounts2);
    }
}
