// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.16;

interface IStaker {
  struct UserClaimableRewards {
    address reward;
    uint256 claimableAmount;
  }

  struct UserClaimedRewards {
    address reward;
    uint256 amount;
  }

  function stake(uint256 amount, address receiver) external returns (uint256);

  function unstake(uint256 amount, address receiver) external returns (uint256);

  function claimRewards(address reward, address receiver) external returns (uint256);

  function claimAllRewards(address receiver) external returns (UserClaimedRewards[] memory);

}