// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./AFeesTest.sol";

contract SetFeeToken is AFeesTest {
    ERC20Mock fakeMock;

    function setUp() public virtual override {
        super.setUp();

        fakeMock = new ERC20Mock("USDC", "USDC", 6);
    }

    function test_setFeeToken_Normal() public {
        vm.prank(owner);
        fees.setFeeToken(address(fakeMock));
        assertEq(address(fees.feeToken()), address(fakeMock), "FeeToken should be usdc");
    }

    function test_setFeeToken_NotOwner() public {
        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        fees.setFeeToken(address(fakeMock));
    }

    function test_setFeeToken_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        fees.setFeeToken(address(0));
    }
}
