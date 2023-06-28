// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapTest.sol";

contract TestZap is ZapTest {
  address receiver = makeAddr("receiver");

  function testFuzz_zap_Normal(uint256 amount) public {
    IERC20 token = IERC20(randomVlToken(amount));
    amount = bound(amount, 1e4, token.balanceOf(alice));

    uint256 prevWarSupply = war.totalSupply();
    assertEqDecimal(war.balanceOf(alice), 0, 18, "war balance at the beginning should be zero");
    assertEqDecimal(
      war.balanceOf(address(zap)), 0, 18, "war balance of the zap contract at the beginning should be zero"
    );

    uint256 initialDepositedAmount = vault.balanceOf(receiver);
    uint256 initialBalanceStaker = war.balanceOf(address(vault));

    assertEqDecimal(initialDepositedAmount, 0, 18, "initial deposited balance should be zero");

    uint256 expectedMintAmount = ratios.getMintAmount(address(token), amount);

    vm.startPrank(alice);

    token.approve(address(zap), amount);

    vm.expectEmit(true, true, false, true);
    emit ZapHappened(alice, receiver, expectedMintAmount);

    uint256 stakedAmount = zap.zap(address(token), amount, receiver);

    vm.stopPrank();

    assertEqDecimal(
      stakedAmount, expectedMintAmount, 18, "The amount staked should correspond to the ratios expected amount"
    );
    assertEqDecimal(
      vault.balanceOf(receiver),
      initialDepositedAmount + expectedMintAmount,
      18,
      "receiver should have a corresponding amount of deposited tokens"
    );

    assertEqDecimal(token.balanceOf(address(zap)), 0, 18, "The zap contract shouldn't have any vltoken after zap");

    assertEqDecimal(
      war.totalSupply(),
      prevWarSupply + expectedMintAmount,
      18,
      "the war total supply should have increased accordingly"
    );
    assertEqDecimal(war.balanceOf(alice), 0, 18, "alice shouldn't have any war after zap");
    assertEqDecimal(war.balanceOf(address(zap)), 0, 18, "the zap contract shoulnd't have any war token after zap");

    assertEqDecimal(war.balanceOf(alice), 0, 18, "alice shouldn't have any unstaked war after zap");
    assertEqDecimal(
      war.balanceOf(address(staker)),
      initialBalanceStaker + expectedMintAmount,
      18,
      "staker should have received sender's war tokens"
    );
  }

  function test_zap_ZeroAmount() public {
    vm.expectRevert(Errors.ZeroValue.selector);
    zap.zap(address(aura), 0, address(this));

    vm.expectRevert(Errors.ZeroValue.selector);
    zap.zap(address(cvx), 0, address(this));
  }

  function test_zap_AddressZeroToken() public {
    vm.expectRevert(Errors.ZeroAddress.selector);
    zap.zap(zero, 1e18, address(this));
  }

  function test_zap_AddressZeroReceiver() public {
    vm.expectRevert(Errors.ZeroAddress.selector);
    zap.zap(address(aura), 1e18, zero);

    vm.expectRevert(Errors.ZeroAddress.selector);
    zap.zap(address(cvx), 1e18, zero);
  }
}