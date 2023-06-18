// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.20;

import "forge-std/Test.sol";
import {Ratios} from "../src/Ratios.sol";

contract RatiosTest is Test {
    Ratios ratios;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);

    function setUp() public {}
}
