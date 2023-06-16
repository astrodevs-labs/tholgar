// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";

contract VaultTest is Test {
    Vault token;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);

    function setUp() public {
    }
}
