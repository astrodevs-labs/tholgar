// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

interface IZap {
  function zap(address token, uint256 amount, address receiver) external returns (uint256);
  function zapMultiple(address[] calldata vlTokens, uint256[] calldata amounts, address receiver) external returns (uint256);
}