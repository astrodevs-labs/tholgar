// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {Swap} from "../src/Swap.sol";
import {ISwap} from "../src/interfaces/ISwap.sol";
import {STAKER, WAR} from "../src/utils/constants.sol";

contract VaultTest is Test {
    Vault vault;
    Swap swap;

    address public alice = vm.addr(0x1);
    address public bernard = vm.addr(0x2);
    address public owner = vm.addr(0x3);

    function setUp() public {
        vm.startBroadcast(owner);
        swap = new Swap();
        vault = new Vault(STAKER, address(swap), WAR);
        vm.stopBroadcast();
    }

    function test_deploy_swap() public {
        assertEq(address(swap), vault.swap());
    }

    function test_deploy_asset() public {
        assertEq(WAR, address(vault.asset()));

    }

    function test_deploy_staker() public {
        assertEq(STAKER, vault.staker());
    }
}
