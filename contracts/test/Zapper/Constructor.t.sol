// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapperTest.sol";

contract Constructor is ZapperTest {
    function test_constructor_Normal() public {
        assertEq(address(zapper.swapRouter()), address(augustusSwapper), "swapRouter is not assigned correctly in constructor");
        assertEq(address(zapper.owner()), address(owner), "owner is not assigned correctly in constructor");
        assertEq(address(zapper.vault()), address(vault), "vault is not assigned correctly in constructor");
        assertEq(address(zapper.warMinter()), address(minter), "warMinter is not assigned correctly in constructor");
        assertEq(address(zapper.tokenTransferAddress()), address(tokenTransferAddress), "tokenTransferAddress is not assigned correctly in constructor");
    }

    function test_constructor_ZeroAddressAugustusSwapper() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zapper(address(owner), address(0), address(tokenTransferAddress), address(minter), address(vault));
    }

    function test_constructor_ZeroAddressTokenTransferAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zapper(address(owner), address(augustusSwapper), address(0), address(minter), address(vault));
    }

    function test_constructor_ZeroAddressWarMinter() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zapper(address(owner), address(augustusSwapper), address(tokenTransferAddress), address(0), address(vault));
    }

    function test_constructor_ZeroAddressVault() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zapper(address(owner), address(augustusSwapper), address(tokenTransferAddress), address(minter), address(0));
    }
}
