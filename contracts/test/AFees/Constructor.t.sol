// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AFeesTest.sol";

contract Constructor is AFeesTest {
    function test_constructor_Normal() public {
        assertEq(fees.harvestFee(), 500, "HarvestFee should be 500");
        assertEq(fees.feeRecipient(), owner, "FeeRecipient should be owner");
        assertEq(fees.feeToken(), address(feeToken), "FeeToken should be feeToken");
    }

    function test_constructor_ZeroAddressFeeRecipient() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new AFeesMock(500, address(0), address(feeToken));
    }

    function test_constructor_ZeroAddressFeeToken() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new AFeesMock(500, owner, address(0));
    }

    function test_constructor_InvalidFee(uint256 amount) public {
        amount = bound(amount, fees.MAX_BPS(), UINT256_MAX);

        vm.expectRevert(Errors.InvalidFee.selector);
        new AFeesMock(amount, owner, address(feeToken));
    }
}