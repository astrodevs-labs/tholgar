// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";
import {Errors} from "../../src/utils/Errors.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

contract TotalAssets is VaultTest {
    function setUp() public override {
        VaultTest.setUp();
    }

    function testFuzz_totalAssets_Normal(uint256 amount) public {
        deal(address(staker), address(vault), amount);

        assertEqDecimal(vault.totalAssets(), amount, 18, "Total assets should be equal to the amount of staker tokens");
    }
}