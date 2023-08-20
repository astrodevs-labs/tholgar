// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "./VaultTest.sol";

contract Harvest is VaultTest {
    function test_harvest_NotOwnerOrOperator() public {
        bytes[] memory data = new bytes[](0);
        address[] memory tokensToHarvest = new address[](0);
        address[] memory tokensToSwap = new address[](0);

        vm.prank(bob);
        vm.expectRevert(Errors.NotOperatorOrOwner.selector);
        vault.harvest(tokensToHarvest, tokensToSwap, data);
    }

    function test_harvest_Normal(uint256 amount) public {
        amount = bound(amount, 1, UINT256_MAX);

        bytes[] memory data = new bytes[](3);
        address[] memory tokensToHarvest = new address[](3);
        address[] memory tokensToSwap = new address[](3);

        IStaker.UserClaimableRewards[] memory claimableAmounts = new IStaker.UserClaimableRewards[](3);
        claimableAmounts[0].claimableAmount = amount;
        claimableAmounts[0].reward = address(cvx);
        claimableAmounts[1].claimableAmount = 0;
        claimableAmounts[1].reward = address(weth);
        claimableAmounts[2].claimableAmount = 0;
        claimableAmounts[2].reward = address(aura);

        tokensToHarvest[0] = address(cvx);
        tokensToHarvest[1] = address(weth);
        tokensToHarvest[2] = address(aura);

        tokensToSwap[0] = address(cvx);
        tokensToSwap[1] = address(weth);
        tokensToSwap[2] = address(aura);

        deal(address(cvx), address(vault), amount);
        deal(address(weth), address(vault), amount);
        deal(address(aura), address(vault), amount);

        vm.mockCall(
            vault.staker(),
            abi.encodeWithSelector(staker.getUserTotalClaimableRewards.selector, address(vault)),
            abi.encode(claimableAmounts)
        );
        deal(address(vault.feeToken()), address(vault), amount);

        vm.expectEmit(true, false, false, true);
        emit Harvested(0);

        vm.prank(owner);
        vault.harvest(tokensToHarvest, tokensToSwap, data);

        assertEq(IERC20(vault.feeToken()).balanceOf(address(vault)), amount, "Vault should have all except fee");
        assertEq(IERC20(vault.feeToken()).balanceOf(vault.feeRecipient()), 0, "Fee recipient should have all fee");
    }
}
