// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Test.sol";

abstract contract AutoCompounderTest is Test {
    address public owner = makeAddr("owner");

    address constant WAR = 0xa8258deE2a677874a48F5320670A869D74f0cbC1;
    address constant STAKER = 0xA86c53AF3aadF20bE5d7a8136ACfdbC4B074758A;
    address constant MINTER = 0x144a689A8261F1863c89954930ecae46Bd950341;

    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant AUGUSTUS_SWAPPER = 0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57;

    function setUp() public virtual {
        vm.createSelectFork(vm.rpcUrl("ethereum_mainet"), 17_544_699);
    }
}
