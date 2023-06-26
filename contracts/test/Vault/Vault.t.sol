// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {ASwapper} from "../../src/abstracts/ASwapper.sol";
import {WarStaker} from "warlord/Staker.sol";
import {Vault} from "../../src/Vault.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract VaultConstructorTest is MainnetTest {
    Vault vault;

    function setUp() public virtual override {
        MainnetTest.setUp();
        fork();
    }

    function test_VaultContructor_goodDeployment() public {
        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(address(usdc), 18, 10_000);
        vault = new Vault(address(staker), minter, 500, owner, address(usdc), augustusSwapper, operator, address(war));
        vault.setOutputTokens(tokens);
        vm.stopPrank();

        assertEqDecimal(vault.harvestFee(), 500, 2);
        assertEq(vault.feeRecipient(), owner);
        assertEq(address(vault.feeToken()), address(usdc));
        assertFalse(vault.paused());
        assertEq(address(vault.asset()), address(war));
        assertEq(vault.staker(), address(staker));
        assertEq(vault.asset().allowance(address(vault), address(staker)), UINT256_MAX);
    }

    /*
    this is fine
    function test_VaultConstructor_zeroStakerAddress() public {
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(address(usdc), 18, 10_000);
        //vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault = new Vault(address(0), minter, 500, owner, address(usdc), augustusSwapper, operator, address(war));
        vault.setOutputTokens(tokens);
    }
    */
}