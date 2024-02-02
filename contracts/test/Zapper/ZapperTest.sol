// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../Vault/VaultTest.sol";
import { Zapper } from "../../src/Zapper.sol";
import { Vault } from "../../src/Vault.sol";

contract ZapperTest is VaultTest {
    uint256 constant cvxMaxSupply = 100_000_000e18;
    uint256 constant auraMaxSupply = 100_000_000e18;

    Zapper zapper;

    event ZapHappened(address indexed sender, address indexed receiver, uint256 stakedAmount);

    function setUp() public virtual override {
        VaultTest.setUp();

        vm.startPrank(owner);

        zapper = new Zapper(owner, augustusSwapper, tokenTransferAddress, address(minter), address(vault));

        zapper.resetWarlordAllowances();

        vm.stopPrank();

        deal(address(weth), address(alice), 10_000e18);
        deal(address(usdc), address(alice), 10_000e18);
    }
}
