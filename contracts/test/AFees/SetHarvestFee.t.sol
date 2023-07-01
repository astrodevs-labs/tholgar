// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AFeesTest.sol";

contract SetHarvestFee is AFeesTest {
    function setUp() public override {
        AFeesTest.setUp();
    }

    function testFuzz_setHarvestFee_Normal(uint256 amount) public {
        amount = bound(amount, 0, 10000);

        vm.prank(owner);
        fees.setHarvestFee(100);
        assertEq(fees.harvestFee(), 100, "HarvestFee should be 100");
    }

    function test_setHarvestFee_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        fees.setHarvestFee(100);
    }

    function testFuzz_setHarvestFee_InvalidFee(uint256 amount) public {
        amount = bound(amount, 10001, UINT256_MAX);

        vm.expectRevert(Errors.InvalidFee.selector);
        vm.prank(owner);
        fees.setHarvestFee(10001);
    }
}
