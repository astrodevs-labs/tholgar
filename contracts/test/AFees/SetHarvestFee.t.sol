// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AFeesTest.sol";

contract SetHarvestFee is AFeesTest {
    function test_setHarvestFee_Normal(uint256 amount) public {
        amount = bound(amount, 0, fees.MAX_BPS());

        vm.expectEmit(true, true, false, true);
        emit HarvestFeeUpdated(fees.harvestFee(), amount);

        vm.prank(owner);
        fees.setHarvestFee(amount);
        assertEq(fees.harvestFee(), amount, "HarvestFee should be amount");
    }

    function test_setHarvestFee_NotOwner(uint256 amount) public {
        amount = bound(amount, 0, fees.MAX_BPS());

        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        fees.setHarvestFee(amount);
    }

    function test_setHarvestFee_InvalidFee(uint256 amount) public {
        amount = bound(amount, fees.MAX_BPS() + 1, UINT256_MAX);

        vm.expectRevert(Errors.InvalidFee.selector);
        vm.prank(owner);
        fees.setHarvestFee(amount);
    }
}
