pragma solidity ^0.8.0;
//SPDX-License-Identifier: Unlicensed

library Errors {
    // General errors
    error ZeroValue();
    error ZeroAddress();
    error EmptyArray();
    error DifferentSizeArrays(uint256 length1, uint256 length2);

    // Fee errors
    error InvalidFee();

    // Swapper errors
    error NoOutputTokens();
    error RatioOverflow();
    error SwapError();

    // Gelato errors
    error NotGelato();
}
