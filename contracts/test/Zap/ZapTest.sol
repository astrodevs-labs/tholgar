// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../Vault/VaultTest.sol";
import {Zap} from "../../src/Zap.sol";
import {WarStaker} from "warlord/Staker.sol";
import {Vault} from "../../src/Vault.sol";

contract ZapTest is VaultTest {
  uint256 constant cvxMaxSupply = 100_000_000e18;
  uint256 constant auraMaxSupply = 100_000_000e18;

  Zap zap;

  event ZapHappened(address indexed sender, address indexed receiver, uint256 stakedAmount);

  function setUp() public virtual override {
    VaultTest.setUp();

    vm.startPrank(owner);

    zap = new Zap(address(war), address(vault), address(minter));

    vm.stopPrank();
  }
}
