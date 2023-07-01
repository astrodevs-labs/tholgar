// SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import {Errors} from "../src/utils/Errors.sol";
import "forge-std/Test.sol";

contract BaseTest is Test {
    // Useful addresses
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address admin = makeAddr("admin");
    address owner = makeAddr("owner");
    address zero = address(0);
}

// make a function that takes a list of addresses and returns a random one
function randomAddress(address[] memory addrs, uint256 seed) pure returns (address) {
    return addrs[seed % addrs.length];
}

function randomBinaryAddress(address option1, address option2, uint256 seed) pure returns (address) {
    // implement using previous function
    address[] memory options = new address[](2);
    options[0] = option1;
    options[1] = option2;
    return randomAddress(options, seed);
}

function randomBoolean(uint256 seed) pure returns (bool) {
    return seed % 2 == 0;
}
/*
function generateAddressArray(uint256 size) pure returns (address[] memory addrArray) {
  if (size == 0) return new address[](0);
  uint256[] memory numArray = linspace(uint256(0), uint256(uint160(0x9999999999999999999999999999999999999999)), size);
  addrArray = new address[](size);
  for (uint256 i; i < size; ++i) {
    addrArray[i] = address(uint160(numArray[i]));
  }
}
*/

function generateAddressArrayFromHash(uint256 seed, uint256 len) pure returns (address[] memory addrArray) {
    seed = seed % 1e77;
    if (len == 0) return new address[](0);
    addrArray = new address[](len);
    for (uint256 i; i < len; ++i) {
        addrArray[i] = address(uint160(bytes20((keccak256(abi.encode(seed + i))))));
    }
}

function generateNumberArrayFromHash(uint256 seed, uint256 len, uint256 upperBound)
    pure
    returns (uint256[] memory numArray)
{
    seed = seed % 1e77;
    if (len == 0) return new uint256[](0);
    numArray = new uint256[](len);
    for (uint256 i; i < len; ++i) {
        // numArray[i] = uint160(bytes20((keccak256(abi.encode(seed + i)))));
        numArray[i] = uint256((keccak256(abi.encode(seed + i)))) % upperBound + 1;
    }
}

function generateNumberArrayFromHash2(uint256 seed, uint256 len, uint256 lowerBound, uint256 upperBound)
    pure
    returns (uint256[] memory numArray)
{
    seed = seed % 1e77;
    if (len == 0) return new uint256[](0);
    numArray = new uint256[](len);
    for (uint256 i; i < len; ++i) {
        // numArray[i] = uint160(bytes20((keccak256(abi.encode(seed + i)))));
        numArray[i] = uint256((keccak256(abi.encode(seed + i)))) % (upperBound - lowerBound + 1) + lowerBound;
    }
}
