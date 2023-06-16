// SPDX-License-Identifier: Unlicensed

pragma solidity 0.8.16;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {IMinter} from "warlord/interfaces/IMinter.sol";
import {STAKER, WAR} from "./utils/constants.sol";
import {Owner} from "warlord/utils/Owner.sol";

contract ACWarToken is ERC20, Owner {
    using SafeERC20 for IERC20;

    constructor() ERC20("acWARToken", "acWAR", 18) {}

    function deposit(uint256 amount, address receiver) external {
        amount = IStaker(STAKER).stake(amount, _msgSender());

        _mint(receiver, amount);
    }

    function withdraw(uint256 amount, address receiver) external {
        _burn(_msgSender(), amount);

        IStaker(STAKER).unstake(amount, receiver);
    }
}
