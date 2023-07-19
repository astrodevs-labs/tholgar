// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract SetTokenNotToHarvest is VaultTest {
    function test_setTokenToHarvest_Normal(uint256 seed, uint256 length) public {
        length = bound(length, 1, 10);
        address[] memory tokens = generateAddressArrayFromHash(seed, length);
        uint256[] memory harvests = generateNumberArrayFromHash(seed, length, 1);

        for (uint256 i = 0; i < length; ++i) {
            vm.expectEmit(true, true, false, true);
            emit TokenToHarvestUpdated(tokens[i], harvests[i] != 0);

            vm.prank(owner);
            vault.setTokenNotToHarvest(tokens[i], harvests[i] != 0);

            assertTrue(vault.tokensNotToHarvest(tokens[i]), "tokensNotToHarvest should be true");
        }
    }

    function test_setTokenToHarvest_ZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        vm.prank(owner);
        vault.setTokenNotToHarvest(address(0), true);
    }

    function test_setTokenToHarvest_NotOwner() public {
        vm.prank(bob);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setTokenNotToHarvest(address(usdc), true);
    }
}
