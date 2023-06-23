// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {Zap} from "../src/Zap.sol";

contract ZapTest is Test {
    Zap zap;

    address public alice = makeAddr("alice");
    address public bernard = makeAddr("bernard");

    function setUp() public {}
}
