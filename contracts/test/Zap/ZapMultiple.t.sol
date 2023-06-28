// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapTest.sol";

contract ZapMutiple is ZapTest {
  address receiver = makeAddr("receiver");

  function testFuzz_zapMultiple_DefaultBehavior(uint256 amountCvx, uint256 amountAura) public {
    amountCvx = bound(amountCvx, 1e4, cvx.balanceOf(alice));
    amountAura = bound(amountAura, 1e4, aura.balanceOf(alice));

    address[] memory tokens = new address[](2);
    tokens[0] = address(cvx);
    tokens[1] = address(aura);
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = amountCvx;
    amounts[1] = amountAura;

    uint256 prevWarSupply = war.totalSupply();
    assertEq(war.balanceOf(alice), 0);
    assertEq(war.balanceOf(address(zap)), 0);

    uint256 initialDepositedAmount = vault.balanceOf(receiver);
    uint256 initialBalanceStaker = war.balanceOf(address(vault));

    assertEq(initialDepositedAmount, 0, "initial deposited balance should be zero");

    uint256 expectedMintAmount;
    expectedMintAmount += ratios.getMintAmount(address(cvx), amountCvx);
    expectedMintAmount += ratios.getMintAmount(address(aura), amountAura);

    vm.startPrank(alice);
    cvx.approve(address(zap), amountCvx);
    aura.approve(address(zap), amountAura);

    vm.expectEmit(true, true, false, true);
    emit ZapHappened(alice, receiver, expectedMintAmount);

    uint256 stakedAmount = zap.zapMultiple(tokens, amounts, receiver);

    vm.stopPrank();

    assertEq(stakedAmount, expectedMintAmount);

    assertEq(cvx.balanceOf(address(zap)), 0);
    assertEq(aura.balanceOf(address(zap)), 0);

    assertEq(war.totalSupply(), prevWarSupply + expectedMintAmount);
    assertEq(war.balanceOf(alice), 0);
    assertEq(war.balanceOf(address(zap)), 0);

    assertEq(war.balanceOf(alice), 0);
    assertEq(
      war.balanceOf(address(staker)),
      initialBalanceStaker + expectedMintAmount,
      "contract should have received sender's war tokens"
    );
    assertEq(
      vault.balanceOf(receiver),
      initialDepositedAmount + expectedMintAmount,
      "receiver should have a corresponding amount of deposited tokens"
    );
  }

  function test_zapMultiple_ArrayEmpty() public {
    address[] memory tokens = new address[](0);
    uint256[] memory amounts = new uint256[](0);

    vm.expectRevert(Errors.EmptyArray.selector);
    zap.zapMultiple(tokens, amounts, alice);
  }

  function test_zapMultiple_ArraySizeDifferent() public {
    address[] memory tokens = new address[](2);
    tokens[0] = address(cvx);
    tokens[1] = address(aura);
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 1e18;

    vm.expectRevert(abi.encodeWithSelector(Errors.DifferentSizeArrays.selector, tokens.length, amounts.length));
    zap.zapMultiple(tokens, amounts, alice);
  }

  function test_zapMultiple_ZeroAmount1() public {
    address[] memory tokens = new address[](2);
    tokens[0] = address(cvx);
    tokens[1] = address(aura);
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = 0;
    amounts[1] = 1e18;

    vm.startPrank(alice);
    cvx.approve(address(zap), type(uint256).max);
    aura.approve(address(zap), type(uint256).max);

    vm.expectRevert(Errors.ZeroValue.selector);
    zap.zapMultiple(tokens, amounts, alice);

    vm.stopPrank();
  }

  function test_zapMultiple_ZeroAmount2() public {
    address[] memory tokens = new address[](2);
    tokens[0] = address(cvx);
    tokens[1] = address(aura);
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = 1e18;
    amounts[1] = 0;

    vm.startPrank(alice);
    cvx.approve(address(zap), type(uint256).max);
    aura.approve(address(zap), type(uint256).max);

    vm.expectRevert(Errors.ZeroValue.selector);
    zap.zapMultiple(tokens, amounts, alice);

    vm.stopPrank();
  }

  function test_zapMultiple_AddressZeroToken1() public {
    address[] memory tokens = new address[](2);
    tokens[0] = zero;
    tokens[1] = address(aura);
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = 1e18;
    amounts[1] = 1e18;

    vm.startPrank(alice);
    cvx.approve(address(zap), type(uint256).max);
    aura.approve(address(zap), type(uint256).max);

    vm.expectRevert(Errors.ZeroAddress.selector);
    zap.zapMultiple(tokens, amounts, alice);

    vm.stopPrank();
  }

  function test_zapMultiple_AddressZeroToken2() public {
    address[] memory tokens = new address[](2);
    tokens[0] = address(cvx);
    tokens[1] = zero;
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = 1e18;
    amounts[1] = 1e18;

    vm.startPrank(alice);
    cvx.approve(address(zap), type(uint256).max);
    aura.approve(address(zap), type(uint256).max);

    vm.expectRevert(Errors.ZeroAddress.selector);
    zap.zapMultiple(tokens, amounts, alice);

    vm.stopPrank();
  }

  function test_zapMultiple_AddressZeroReceiver() public {
    address[] memory tokens = new address[](2);
    tokens[0] = address(cvx);
    tokens[1] = address(aura);
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = 1e18;
    amounts[1] = 1e18;

    vm.expectRevert(Errors.ZeroAddress.selector);
    zap.zapMultiple(tokens, amounts, zero);
  }
}