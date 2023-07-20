// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {AWeightedTokens} from "../../src/abstracts/AWeightedTokens.sol";
import {Vault} from "../../src/Vault.sol";
import {Swapper} from "../../src/Swapper.sol";

contract VaultTest is MainnetTest {
    Vault vault;
    Swapper swapper;

    event MinterUpdated(address oldMinter, address newMinter);
    event StakerUpdated(address oldStaker, address newStaker);
    event TokenNotToHarvestUpdated(address token, bool harvestOrNot);
    event SwapperUpdated(address oldSwapper, address newSwapper);
    event Harvested(uint256 amount);
    event Compounded(uint256 amount);

    function setUp() public virtual override {
        MainnetTest.setUp();
        fork();

        vm.startPrank(owner);

        swapper = new Swapper(augustusSwapper, tokenTransferAddress);

        AWeightedTokens.WeightedToken[] memory tokens = new AWeightedTokens.WeightedToken[](2);
        tokens[0] = AWeightedTokens.WeightedToken(address(aura), 5_000);
        tokens[1] = AWeightedTokens.WeightedToken(address(cvx), 5_000);
        vault =
        new Vault(address(staker), address(minter), address(swapper), 500, owner, address(usdc), operator, address(war));
        vault.setWeightedTokens(tokens);
        vault.setTokenNotToHarvest(address(cvx), true);
        vault.setTokenNotToHarvest(address(aura), true);
        vm.stopPrank();
    }
}
