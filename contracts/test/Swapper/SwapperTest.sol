// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {Swapper} from "../../src/Swapper.sol";
import {ERC20Mock} from "../mock/ERC20.sol";

contract SwapperTest is MainnetTest {
    Swapper swapper;

    event SwapRouterUpdated(address oldSwapRouter, address newSwapRouter);
    event TokenTransferAddressUpdated(address oldTokenTransferAddress, address newTokenTransferAddress);

    function setUp() public virtual override {
        super.setUp();
        fork();

        vm.startPrank(owner);

        swapper = new Swapper(augustusSwapper, tokenTransferAddress);

        vm.stopPrank();
    }
}
