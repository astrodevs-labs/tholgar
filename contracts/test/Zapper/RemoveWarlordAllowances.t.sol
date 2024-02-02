// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapperTest.sol";

contract RemoveWarlordAllowances is ZapperTest {
    function test_removeWarlordAllowances_Normal() public {
        vm.startPrank(owner);
        zapper.resetWarlordAllowances();

        assertEq(cvx.allowance(address(zapper), address(minter)), type(uint256).max, "allowance is not set correctly");
        assertEq(aura.allowance(address(zapper), address(minter)), type(uint256).max, "allowance is not set correctly");
        assertEq(war.allowance(address(zapper), address(vault)), type(uint256).max, "allowance is not set correctly");

        zapper.removeWarlordAllowances();

        assertEq(cvx.allowance(address(zapper), address(minter)), 0, "allowance is not set correctly");
        assertEq(aura.allowance(address(zapper), address(minter)), 0, "allowance is not set correctly");
        assertEq(war.allowance(address(zapper), address(vault)), 0, "allowance is not set correctly");

        vm.stopPrank();
    }
}
