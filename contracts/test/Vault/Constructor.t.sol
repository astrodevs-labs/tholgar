// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract Constructor is VaultTest {
    function test_constructor_Normal() public {
        assertEq(vault.owner(), owner, "Owner is not owner");
        assertFalse(vault.paused(), "Vault is paused");
        assertEq(vault.minter(), address(minter), "Minter is not minter");
        assertEq(address(vault.asset()), address(war), "Asset is not WAR");
        assertEq(vault.staker(), address(staker), "Staker is not staker");
        assertTrue(vault.tokenToHarvest(address(usdc)), "usdc should be tokenToHarvest");
        assertTrue(vault.tokenToHarvest(address(aura)), "aura should be tokenToHarvest");
        assertEq(vault.asset().allowance(address(vault), address(staker)), UINT256_MAX, "Staker allowance is not max");
    }

    function test_constructor_ZeroAddressStaker() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault =
        new Vault(address(0), address(minter), 500, owner, address(usdc), augustusSwapper, tokenTransferAddress, operator, address(war));
    }

    function test_constructor_ZeroAddressMinter() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault =
        new Vault(address(staker), address(0), 500, owner, address(usdc), augustusSwapper, tokenTransferAddress, operator, address(war));
    }
}
