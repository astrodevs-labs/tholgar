// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import { Zapper } from "../src/Zapper.sol";
import "forge-std/Script.sol";

contract DeployZapper is Script {
    address constant augustusSwapper = 0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57;
    address constant tokenTransferAddress = 0x216B4B4Ba9F3e719726886d34a177484278Bfcae;

    address owner;

    function setUp() public {
        // ALl variables to set up the vault
        owner = vm.envAddress("OWNER");
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.rememberKey(deployerPrivateKey);
        vm.startBroadcast(deployer);

        Zapper zap = new Zapper(owner, augustusSwapper, tokenTransferAddress);
        console.log("Zap deployed at: %s", address(zap));

        vm.stopBroadcast();
    }
}
