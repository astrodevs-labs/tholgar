// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "../BaseTest.sol";
import {AFeesMock} from "../mock/AFees.sol";
import {ERC20Mock} from "../mock/ERC20.sol";

contract AFeesTest is BaseTest {
    AFeesMock fees;
    ERC20Mock feeToken;

    function setUp() public virtual {
        vm.startPrank(owner);

        feeToken = new ERC20Mock("Fee Token", "FEE", 18);
        fees = new AFeesMock(500, owner, address(feeToken));

        vm.stopPrank();
    }
}
