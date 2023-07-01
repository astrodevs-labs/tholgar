// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapTest.sol";

contract Constructor is ZapTest {
    function test_constructor_Normal() public {
        assertEq(address(zap.asset()), address(war), "war token is not assigned correctly in constructor");
        assertEq(address(zap.minter()), address(minter), "war minter is not assigned correctly in constructor");
        assertEq(address(zap.vault()), address(vault), "vault is not assigned correctly in constructor");
    }

    function test_constructor_ZeroAddressWar() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zap(address(0), address(vault), address(minter));
    }

    function test_constructor_ZeroAddressVault() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zap(address(war), address(0), address(minter));
    }

    function test_constructor_ZeroAddressMinter() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new Zap(address(war), address(vault), address(0));
    }

    function test_constructor_MaxAllowance() public {
        assertEqDecimal(
            IERC20(address(war)).allowance(address(zap), address(vault)),
            UINT256_MAX,
            18,
            "allowance should be set to max"
        );
    }
}
