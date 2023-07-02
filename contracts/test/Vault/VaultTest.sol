// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {ASwapper} from "../../src/abstracts/ASwapper.sol";
import {WarStaker} from "warlord/Staker.sol";
import {Vault} from "../../src/Vault.sol";

contract VaultTest is MainnetTest {
    Vault vault;
    WarStaker staker;

    function setUp() public virtual override {
        MainnetTest.setUp();
        fork();

        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](1);
        tokens[0] = ASwapper.OutputToken(address(usdc), 18, 10_000);
        staker = new WarStaker(address(war));
        vault =
        new Vault(address(staker), address(minter), 500, owner, address(usdc), augustusSwapper, tokenTransferAddress, operator, address(war));
        vault.setOutputTokens(tokens);
        vm.stopPrank();
    }
}
