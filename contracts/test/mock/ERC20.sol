// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import {ERC20} from "solmate/tokens/ERC20.sol";

contract ERC20Mock is ERC20 {
  constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol, decimals) {}
}
