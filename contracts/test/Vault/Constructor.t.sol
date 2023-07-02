// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {ASwapper} from "../../src/abstracts/ASwapper.sol";
import {WarStaker} from "warlord/Staker.sol";
import {Vault} from "../../src/Vault.sol";
import {Errors} from "../../src/utils/Errors.sol";

contract Constructor is MainnetTest {
    Vault vault;

    function setUp() public virtual override {
        MainnetTest.setUp();
        fork();
    }

    function test_VaultContructor_GoodDeployment() public {
        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(address(usdc), 10_000);
        WarStaker staker = new WarStaker(address(war));
        vault =
        new Vault(address(staker), address(minter), 500, owner, address(usdc), augustusSwapper, tokenTransferAddress, operator, address(war));
        vault.setOutputTokens(tokens);
        vm.stopPrank();

        assertFalse(vault.paused(), "Vault is paused");
        assertEq(address(vault.asset()), address(war), "Asset is not WAR");
        assertEq(vault.staker(), address(staker), "Staker is not staker");
        assertEq(vault.asset().allowance(address(vault), address(staker)), UINT256_MAX, "Staker allowance is not max");
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
