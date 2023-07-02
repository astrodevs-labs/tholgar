// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../MainnetTest.sol";
import {ASwapperMock, ASwapper} from "../mock/ASwapper.sol";
import {ERC20Mock} from "../mock/ERC20.sol";

contract ASwapperTest is MainnetTest {
    ASwapperMock swapper;

    event SwapRouterUpdated(address oldSwapRouter, address newSwapRouter);
    event TokenTransferAddressUpdated(address oldTokenTransferAddress, address newTokenTransferAddress);
    event OutputTokensUpdated(ASwapper.OutputToken[] tokens);

    function setUp() public virtual override {
        super.setUp();
        fork();

        vm.startPrank(owner);

        swapper = new ASwapperMock(augustusSwapper, tokenTransferAddress);

        vm.stopPrank();
    }
}
