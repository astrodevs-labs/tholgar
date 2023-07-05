// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {ASwapper} from "../../src/abstracts/ASwapper.sol";
import {Vault} from "../../src/Vault.sol";

contract VaultTest is MainnetTest {
    Vault vault;

    event MinterUpdated(address oldMinter, address newMinter);
    event StakerUpdated(address oldStaker, address newStaker);
    event TokenToHarvestUpdated(address token, bool harvestOrNot);
    event Harvested(uint256 amount);
    event Compounded(uint256 amount);

    function setUp() public virtual override {
        MainnetTest.setUp();
        fork();

        vm.startPrank(owner);
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](2);
        tokens[0] = ASwapper.OutputToken(address(aura), 5_000);
        tokens[1] = ASwapper.OutputToken(address(cvx), 5_000);
        vault =
        new Vault(address(staker), address(minter), 500, owner, address(usdc), augustusSwapper, tokenTransferAddress, operator, address(war));
        vault.setOutputTokens(tokens);
        vault.setTokenToHarvest(address(usdc), true);
        vault.setTokenToHarvest(address(aura), true);
        vm.stopPrank();
    }
}
