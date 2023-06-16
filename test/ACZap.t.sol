// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "forge-std/Test.sol";
import {ACZap} from "../src/ACZap.sol";

contract ACZapTest is Test {
    ACZap token;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);

    function setUp() public {
        token = new ACZap();
    }
}
