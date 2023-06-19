// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import {Owned} from "solmate/auth/Owned.sol";

abstract contract Owned2Step is Owned {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                        PENDING OWNERSHIP STORAGE
    //////////////////////////////////////////////////////////////*/

    address public pendingOwner;

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _owner) Owned(_owner) {}

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() public virtual {
        address sender = msg.sender;
        require(pendingOwner == sender, "Ownable2Step: caller is not the new owner");

        owner = sender;
        emit OwnershipTransferred(owner, pendingOwner);
    }
}
