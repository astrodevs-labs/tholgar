// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Script.sol";
import {Swapper} from "../src/Swapper.sol";

contract SwapperScript is Script {
    function setUp() public {}

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.rememberKey(deployerPrivateKey);
        vm.broadcast(deployer);

        vm.stopBroadcast();
    }
}
