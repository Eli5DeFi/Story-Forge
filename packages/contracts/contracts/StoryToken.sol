// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title StoryToken ($STORY)
 * @dev The native governance and utility token for Story-Forge platform
 * 
 * Features:
 * - Governance voting rights
 * - Creator revenue sharing
 * - Staking rewards
 * - Platform fee discounts
 * - Premium feature access
 */
contract StoryToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    /// @notice Maximum total supply of STORY tokens (1 billion)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Address that receives platform fees
    address public treasury;

    /// @notice Mapping of staked balances per user
    mapping(address => uint256) public stakedBalances;

    /// @notice Mapping of staking timestamps per user
    mapping(address => uint256) public stakingTimestamps;

    /// @notice Mapping of creator revenue share allocations
    mapping(address => uint256) public creatorShares;

    /// @notice Total amount of tokens currently staked
    uint256 public totalStaked;

    /// @notice Annual percentage yield for staking (basis points, 500 = 5%)
    uint256 public stakingAPY = 500; // 5% APY

    /// @notice Minimum staking period in seconds (30 days)
    uint256 public constant MIN_STAKING_PERIOD = 30 days;

    /// @notice Platform fee discount for STORY holders (basis points, 100 = 1%)
    uint256 public feeDiscount = 100; // 1% discount

    /// @notice Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event CreatorRewardDistributed(address indexed creator, uint256 amount);
    event StakingAPYUpdated(uint256 oldAPY, uint256 newAPY);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(
        address _treasury,
        address _initialOwner
    ) ERC20("Story Token", "STORY") {
        require(_treasury != address(0), "Treasury cannot be zero address");
        require(_initialOwner != address(0), "Owner cannot be zero address");
        
        treasury = _treasury;
        _transferOwnership(_initialOwner);
        
        // Initial token distribution
        _mint(_treasury, MAX_SUPPLY.mul(30).div(100)); // 30% to treasury
        _mint(_initialOwner, MAX_SUPPLY.mul(20).div(100)); // 20% to team
        // 50% reserved for community rewards, staking, and ecosystem
    }

    /**
     * @notice Stake STORY tokens to earn rewards and governance rights
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Claim existing rewards before updating stake
        if (stakedBalances[msg.sender] > 0) {
            _claimStakingRewards(msg.sender);
        }

        _transfer(msg.sender, address(this), amount);
        
        stakedBalances[msg.sender] = stakedBalances[msg.sender].add(amount);
        stakingTimestamps[msg.sender] = block.timestamp;
        totalStaked = totalStaked.add(amount);

        emit Staked(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Unstake STORY tokens and claim rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot unstake 0 tokens");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        require(
            block.timestamp >= stakingTimestamps[msg.sender].add(MIN_STAKING_PERIOD),
            "Minimum staking period not met"
        );

        uint256 rewards = _calculateStakingRewards(msg.sender);
        
        stakedBalances[msg.sender] = stakedBalances[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);
        
        if (stakedBalances[msg.sender] > 0) {
            stakingTimestamps[msg.sender] = block.timestamp;
        } else {
            delete stakingTimestamps[msg.sender];
        }

        _transfer(address(this), msg.sender, amount);
        
        if (rewards > 0) {
            _mintRewards(msg.sender, rewards);
        }

        emit Unstaked(msg.sender, amount, rewards);
    }

    /**
     * @notice Claim staking rewards without unstaking
     */
    function claimStakingRewards() external nonReentrant {
        require(stakedBalances[msg.sender] > 0, "No tokens staked");
        _claimStakingRewards(msg.sender);
    }

    /**
     * @notice Calculate staking rewards for a user
     * @param user Address to calculate rewards for
     * @return rewards Amount of rewards earned
     */
    function calculateStakingRewards(address user) external view returns (uint256) {
        return _calculateStakingRewards(user);
    }

    /**
     * @notice Get staking info for a user
     * @param user Address to get info for
     * @return staked Amount of tokens staked
     * @return timestamp When tokens were last staked
     * @return rewards Pending rewards
     */
    function getStakingInfo(address user) external view returns (
        uint256 staked,
        uint256 timestamp,
        uint256 rewards
    ) {
        return (
            stakedBalances[user],
            stakingTimestamps[user],
            _calculateStakingRewards(user)
        );
    }

    /**
     * @notice Distribute creator rewards from platform revenue
     * @param creators Array of creator addresses
     * @param amounts Array of reward amounts
     */
    function distributeCreatorRewards(
        address[] calldata creators,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(creators.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < creators.length; i++) {
            require(creators[i] != address(0), "Invalid creator address");
            require(amounts[i] > 0, "Invalid reward amount");
            
            _mintRewards(creators[i], amounts[i]);
            creatorShares[creators[i]] = creatorShares[creators[i]].add(amounts[i]);
            
            emit CreatorRewardDistributed(creators[i], amounts[i]);
        }
    }

    /**
     * @notice Calculate platform fee discount for STORY holders
     * @param user Address to check
     * @param originalFee Original fee amount
     * @return discountedFee Fee amount after discount
     */
    function calculateFeeDiscount(
        address user,
        uint256 originalFee
    ) external view returns (uint256 discountedFee) {
        uint256 userBalance = balanceOf(user).add(stakedBalances[user]);
        
        if (userBalance >= 1000 * 10**18) { // 1000+ STORY tokens
            return originalFee.mul(10000 - feeDiscount).div(10000);
        }
        
        return originalFee;
    }

    /**
     * @notice Check if user has premium access (requires 100+ STORY)
     * @param user Address to check
     * @return hasPremium Whether user has premium access
     */
    function hasPremiumAccess(address user) external view returns (bool) {
        uint256 userBalance = balanceOf(user).add(stakedBalances[user]);
        return userBalance >= 100 * 10**18; // 100 STORY minimum
    }

    /**
     * @notice Update staking APY (only owner)
     * @param newAPY New APY in basis points (500 = 5%)
     */
    function updateStakingAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 5000, "APY too high"); // Max 50% APY
        uint256 oldAPY = stakingAPY;
        stakingAPY = newAPY;
        emit StakingAPYUpdated(oldAPY, newAPY);
    }

    /**
     * @notice Update treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Pause token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Mint tokens to ecosystem fund (only owner)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mintToEcosystem(address to, uint256 amount) external onlyOwner {
        require(totalSupply().add(amount) <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }

    // Internal functions

    function _calculateStakingRewards(address user) internal view returns (uint256) {
        if (stakedBalances[user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp.sub(stakingTimestamps[user]);
        uint256 annualReward = stakedBalances[user].mul(stakingAPY).div(10000);
        
        return annualReward.mul(stakingDuration).div(365 days);
    }

    function _claimStakingRewards(address user) internal {
        uint256 rewards = _calculateStakingRewards(user);
        
        if (rewards > 0) {
            stakingTimestamps[user] = block.timestamp;
            _mintRewards(user, rewards);
        }
    }

    function _mintRewards(address to, uint256 amount) internal {
        require(totalSupply().add(amount) <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}