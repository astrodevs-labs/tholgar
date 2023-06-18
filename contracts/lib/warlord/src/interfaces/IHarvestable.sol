// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

interface IHarvestable {
  function harvest() external;
  function rewardTokens() external view returns (address[] memory);
}
