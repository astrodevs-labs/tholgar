// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./BaseTest.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {WarStaker} from "warlord/Staker.sol";
import {IMinter} from "warlord/interfaces/IMinter.sol";
import {IRatios} from "warlord/interfaces/IRatios.sol";

contract MainnetTest is BaseTest {
    IRatios constant ratios = IRatios(0xE40004395384455326c7a27A85204801C7f85F94);
    IERC20 constant war = IERC20(0xa8258deE2a677874a48F5320670A869D74f0cbC1);
    IMinter constant minter = IMinter(0x144a689A8261F1863c89954930ecae46Bd950341);

    IERC20 constant usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    address constant augustusSwapper = 0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57;

    IERC20 constant aura = IERC20(0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF);
    IERC20 constant vlAura = IERC20(0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC);

    IERC20 constant cvx = IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    IERC20 constant vlCvx = IERC20(0x72a19342e8F1838460eBFCCEf09F6585e32db86E);

    function setUp() public virtual {
        vm.label(address(war), "war");

        vm.label(address(usdc), "usdc");

        vm.label(address(vlAura), "vlAura");
        vm.label(address(vlCvx), "vlCvx");
    }

    function fork() public {
        vm.createSelectFork(vm.rpcUrl("ethereum_mainnet"), 17_544_699);
    }

    function randomVlToken(uint256 seed) public pure returns (address token) {
        token = randomBinaryAddress(address(cvx), address(aura), seed);
    }
}
