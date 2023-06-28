// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "forge-std/Script.sol";
import {Owned} from "solmate/auth/Owned.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";
import {IStaker} from "warlord/interfaces/IStaker.sol";
import {Errors} from "../src/utils/Errors.sol";

contract MockStaker is Owned {
    using SafeTransferLib for ERC20;


    constructor() Owned(msg.sender) {}

    /**
   * @notice UserClaimableRewards struct
   *   reward: address of the reward token
   *   claimableAmount: amount of rewards accrued by the user
   */
  struct UserClaimableRewards {
    address reward;
    uint256 claimableAmount;
  }

  /**
   * @notice UserClaimedRewards struct
   *   reward: address of the reward token
   *   amount: amount of rewards claimed by the user
   */
  struct UserClaimedRewards {
    address reward;
    uint256 amount;
  }

  UserClaimableRewards public userClaimableReward;

    function setClaimableRewards(UserClaimableRewards calldata reward) onlyOwner external {
        userClaimableReward = reward;
    }

      function getUserTotalClaimableRewards(address /* user */) external view returns (UserClaimableRewards[] memory) {
        UserClaimableRewards[] memory rewards = new UserClaimableRewards[](1);
        rewards[0] = UserClaimableRewards(userClaimableReward.reward, userClaimableReward.claimableAmount);

        return rewards;
    }

    function claimAllRewards(address user) external returns (UserClaimedRewards[] memory) {
        UserClaimedRewards[] memory rewards = new UserClaimedRewards[](1);
        rewards[0] = UserClaimedRewards(userClaimableReward.reward, userClaimableReward.claimableAmount);

        ERC20(userClaimableReward.reward).safeTransfer(user, userClaimableReward.claimableAmount);
        return rewards;
    }

}

contract MockVault is Owned {
    using SafeTransferLib for ERC20;

    address public feeToken;
    address public operator;
    address public swapRouter;
    address public staker;

    /**
     *  @notice Struct that represent a element in the list of output token and the respective ratio to perform the swap
     */
    struct OutputToken {
        address token; // address of the token
        uint8 decimals; // decimals of the token
        uint256 ratio; // weight (on MAX_WEIGHT total)
    }
    /**
     *  @notice list of tokens to swap to when receiving harvest rewards
     */
    OutputToken[] public outputTokens;

    event Harvested(IStaker.UserClaimedRewards[] rewards);

    modifier onlyOperatorOrOwner() {
        if (msg.sender != operator && msg.sender != owner) revert Errors.NotOperatorOrOwner();
        _;
    }

    constructor(address _operator, address _swapRouter, address _staker, address _feeToken) Owned(msg.sender) {
        operator = _operator;
        swapRouter = _swapRouter;
        staker = _staker;
        feeToken = _feeToken;

        ERC20(feeToken).safeApprove(swapRouter, type(uint256).max);
    }

    /**
     * @notice Return the list of output tokens addresses
     * @return tokens array of addresses
     */
    function getOutputTokenAddresses() public view returns (address[] memory) {
        uint256 length = outputTokens.length;
        address[] memory tokens = new address[](length);

        for (uint256 i; i < length;) {
            tokens[i] = outputTokens[i].token;
            unchecked {
                ++i;
            }
        }
        return tokens;
    }

    /**
     * @notice Return a output token ratio based on the token address
     * @param token address of the token to get the ratio
     * @return ratio of the token
     */
    function getOutputTokenRatio(address token) public view returns (uint256) {
        uint256 length = outputTokens.length;

        for (uint256 i; i < length;) {
            if (outputTokens[i].token == token) return outputTokens[i].ratio;
            unchecked {
                ++i;
            }
        }
        return 0;
    }

    /**
     * @notice Max WEIGHT value (100%)
     */
    uint256 public constant MAX_WEIGHT = 10_000;

     /**
     * @notice Set the list of output tokens and the respective ratios
     * Must call this function in order to let the contract work correctly
     * The sum of all ratios must be equal to MAX_WEIGHT
     * @param newOutputTokens array of OutputToken struct
     * @custom:requires owner
     */
    function setOutputTokens(OutputToken[] calldata newOutputTokens) external onlyOwner {
        uint256 total;
        uint256 length = newOutputTokens.length;

        if (length == 0) revert Errors.NoOutputTokens();
        for (uint256 i; i < length;) {
            total += newOutputTokens[i].ratio;
            unchecked {
                ++i;
            }
        }
        if (total > MAX_WEIGHT) revert Errors.RatioOverflow();

        _copy(outputTokens, newOutputTokens);
    }

    function setFeeToken(address _feeToken) onlyOwner external {
        feeToken = _feeToken;

        ERC20(feeToken).safeApprove(swapRouter, type(uint256).max);
    }

    function setStaker(address _staker) onlyOwner external {
        staker = _staker;
    }

    /**
     * @notice Approve the router/aggregator to spend the token if needed
     * @param _token address of the token to approve
     * @param _spender address of the router/aggregator
     */
    function _approveTokenIfNeeded(address _token, address _spender) internal {
        if (ERC20(_token).allowance(address(this), _spender) == 0) {
            ERC20(_token).safeApprove(_spender, type(uint256).max);
        }
    }

    /**
     * @notice Perform the swap using the router/aggregator
     * @param callData bytes to call the router/aggregator
     */
    function _performRouterSwap(bytes calldata callData) internal {
        (bool success, bytes memory retData) = swapRouter.call(callData);

        if (!success) {
            if (retData.length != 0) {
                assembly {
                    revert(add(32, retData), mload(retData))
                }
            }
            revert Errors.SwapError();
        }
    }

     /**
     * @notice Swap tokens using the router/aggregator
     * @param tokens array of tokens to swap
     * @param callDatas array of bytes to call the router/aggregator
     */
    function _swap(address[] memory tokens, bytes[] calldata callDatas) internal {
        uint256 length = tokens.length;

        for (uint256 i; i < length;) {
            address token = tokens[i];
            _approveTokenIfNeeded(token, address(swapRouter));
            _performRouterSwap(callDatas[i]);
            unchecked {
                ++i;
            }
        }
    }

    function harvest(address[] calldata inputTokens, bytes[] calldata inputCallDatas) external onlyOperatorOrOwner {
        IStaker.UserClaimedRewards[] memory rewards = IStaker(staker).claimAllRewards(address(this));
        emit Harvested(rewards);

        // swap to fee token
        _swap(inputTokens, inputCallDatas);
    }

    /**
     * @notice Copy a OutputToken array to a OutputToken storage array
     * clear the storage array before copying
     * @param dest OutputToken storage array
     * @param src OutputToken calldata array
     */
    function _copy(OutputToken[] storage dest, OutputToken[] calldata src) internal {
        // clear dest storage pointer
        uint256 length = dest.length;
        for (uint256 i; i < length;) {
            delete dest[i];
            unchecked {
                ++i;
            }
        }

        length = src.length;
        for (uint256 i; i < length;) {
            dest.push(src[i]);
            unchecked {
                ++i;
            }
        }
    }

    function compound(bytes[] calldata outputCallDatas)
        external
        onlyOperatorOrOwner
    {
        // swap to outputtokens with correct ratios
        uint256 length = outputTokens.length;
        address[] memory tokens = new address[](length);
        for (uint256 i; i < length;) {
            tokens[i] = feeToken;
            unchecked {
                ++i;
            }
        }
        _swap(tokens, outputCallDatas);
    }

}

contract GelatoScript is Script {
    function setUp() public {}

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MockStaker staker = new MockStaker();
        staker.setClaimableRewards(MockStaker.UserClaimableRewards(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, 553827));
        MockVault vault = new MockVault(0x223e2e64C2489754e0e2033a40952fbd9Bab353D, 0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57, address(staker), 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);

        vm.stopBroadcast();
    }
}
