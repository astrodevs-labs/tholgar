// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {Zap} from "../src/Zap.sol";
import {AutoCompounderTest} from "./utils/AutoCompounderTest.sol";

contract ZapTest is AutoCompounderTest {
    Zap zap;

    function setUp() public override {
        super.setUp();
    }
}
