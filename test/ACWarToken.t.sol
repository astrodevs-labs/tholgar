// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "forge-std/Test.sol";
import {ACWarToken} from "../src/ACWarToken.sol";

contract ACWarTokenTest is Test {
    ACWarToken token;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);

    function setUp() public {
        token = new ACWarToken();
    }
}