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
        ASwapper.OutputToken[] memory tokens = new ASwapper.OutputToken[](2);
        tokens[0] = ASwapper.OutputToken(address(usdc), 5_000);
        tokens[1] = ASwapper.OutputToken(address(weth), 5_000);
        swapper.setOutputTokens(tokens);

        vm.stopPrank();
    }
}
