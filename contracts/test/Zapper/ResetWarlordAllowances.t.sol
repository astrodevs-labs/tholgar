// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./ZapperTest.sol";

contract ResetWarlordAllowances is ZapperTest {
    function test_resetWarlordAllowances_Normal() public {
        vm.prank(owner);
        zapper.resetWarlordAllowances();

        assertEq(cvx.allowance(address(zapper), address(minter)), type(uint256).max, "allowance is not set correctly");
        assertEq(aura.allowance(address(zapper), address(minter)), type(uint256).max, "allowance is not set correctly");
        assertEq(war.allowance(address(zapper), address(vault)), type(uint256).max, "allowance is not set correctly");
    }
}
