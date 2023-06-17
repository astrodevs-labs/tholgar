// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.16;

import "forge-std/Test.sol";
import {Zap} from "../src/Zap.sol";

contract ZapTest is Test {
    Zap zap;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);

    function setUp() public {}
}
