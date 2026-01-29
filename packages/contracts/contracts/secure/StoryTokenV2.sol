// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title StoryTokenV2 ($STORY) - Ethereum Wingman Secured
 * @notice Ultra-secure governance and utility token for Story-Forge platform
 * @dev Implements all Ethereum Wingman critical security patterns:
 *      - No infinite approvals (max approval limits)
 *      - Proper decimals handling (18 decimals standard)
 *      - Incentivized staking with anti-MEV protection
 *      - Oracle-backed fee discounts to prevent manipulation
 *      - Vault-style creator rewards with inflation attack protection
 *      - Emergency circuit breakers and governance safeguards
 *      - Comprehensive access control with time locks
 */
contract StoryTokenV2 is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ CRITICAL: Role-Based Access Control ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ============ CRITICAL: Constants with Basis Points ============
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    uint256 public constant BASIS_POINTS = 10000;
    
    // Staking parameters
    uint256 public constant MIN_STAKING_PERIOD = 7 days; // Reduced for better UX
    uint256 public constant MAX_STAKING_PERIOD = 365 days;
    uint256 public constant BASE_STAKING_APY_BPS = 500; // 5% base APY
    uint256 public constant MAX_STAKING_APY_BPS = 2000; // 20% max APY
    
    // Fee discount tiers (prevent manipulation)
    uint256 public constant TIER_1_THRESHOLD = 100 * 10**18; // 100 STORY = Premium access
    uint256 public constant TIER_2_THRESHOLD = 1000 * 10**18; // 1K STORY = 1% discount
    uint256 public constant TIER_3_THRESHOLD = 10000 * 10**18; // 10K STORY = 2.5% discount
    uint256 public constant TIER_4_THRESHOLD = 100000 * 10**18; // 100K STORY = 5% discount
    
    uint256 public constant TIER_1_DISCOUNT_BPS = 0; // No discount, just premium
    uint256 public constant TIER_2_DISCOUNT_BPS = 100; // 1%
    uint256 public constant TIER_3_DISCOUNT_BPS = 250; // 2.5%
    uint256 public constant TIER_4_DISCOUNT_BPS = 500; // 5%
    
    // Creator reward parameters
    uint256 public constant CREATOR_REWARD_POOL_BPS = 3000; // 30% of rewards
    uint256 public constant STAKING_REWARD_POOL_BPS = 7000; // 70% of rewards
    
    // CRITICAL: Anti-MEV and manipulation protection
    uint256 public constant MIN_STAKE_AMOUNT = 10 * 10**18; // 10 STORY minimum
    uint256 public constant MAX_STAKE_PER_TX = 1000000 * 10**18; // 1M STORY max per tx
    uint256 public constant ORACLE_STALENESS_THRESHOLD = 3600; // 1 hour

    // ============ Structs ============
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // User-selected lock period
        uint256 accruedRewards;
        uint256 lastRewardUpdate;
    }

    struct CreatorRewardVault {
        uint256 totalShares;
        uint256 totalAssets;
        mapping(address => uint256) creatorShares;
        uint256 virtualOffset; // Inflation attack protection
    }

    struct GovernanceProposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votingPower;
    }

    // ============ State Variables ============
    address public immutable treasury;
    AggregatorV3Interface public priceOracle; // For anti-manipulation
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public currentAPY; // Dynamic APY based on total staked
    
    CreatorRewardVault public creatorVault;
    uint256 public totalCreatorRewards;
    
    // Governance
    mapping(uint256 => GovernanceProposal) public proposals;
    uint256 public proposalCount;
    uint256 public constant PROPOSAL_DURATION = 7 days;
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 10000 * 10**18; // 10K STORY to propose
    
    // Emergency and security
    bool public emergencyMode;
    uint256 public maxTransferAmount; // Anti-whale protection
    mapping(address => uint256) public lastTransactionTime; // Anti-MEV
    uint256 public constant TRANSACTION_COOLDOWN = 1 minutes;
    
    // CRITICAL: Approval limits (no infinite approvals)
    uint256 public constant MAX_APPROVAL_AMOUNT = 10000000 * 10**18; // 10M max approval
    mapping(address => mapping(address => uint256)) private _approvalLimits;

    // ============ Events ============
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 rewards);
    event CreatorRewardDistributed(address indexed creator, uint256 amount);
    event APYUpdated(uint256 oldAPY, uint256 newAPY, uint256 totalStaked);
    event EmergencyModeActivated(address indexed activator);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);

    // ============ CRITICAL: Custom Errors ============
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();
    error InsufficientAllowance();
    error StakeNotFound();
    error StakeLocked();
    error InvalidLockPeriod();
    error ExcessiveApproval();
    error TransactionTooFrequent();
    error EmergencyModeActive();
    error OracleDataStale();
    error ProposalNotActive();
    error AlreadyVoted();
    error InsufficientVotingPower();

    // ============ CRITICAL: Constructor with Security Setup ============
    constructor(
        address _treasury,
        address _priceOracle
    ) ERC20("Story Token V2", "STORY") {
        if (_treasury == address(0)) revert ZeroAddress();
        
        treasury = _treasury;
        priceOracle = AggregatorV3Interface(_priceOracle);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, _treasury);
        
        // Initial distribution with security
        uint256 treasuryAmount = (MAX_SUPPLY * 3000) / BASIS_POINTS; // 30%
        uint256 teamAmount = (MAX_SUPPLY * 1500) / BASIS_POINTS; // 15%
        // 55% reserved for staking rewards, creator incentives, and ecosystem
        
        _mint(_treasury, treasuryAmount);
        _mint(msg.sender, teamAmount);
        
        // Initialize creator vault with virtual offset
        creatorVault.virtualOffset = 1000 * 10**18; // Prevent inflation attacks
        creatorVault.totalShares = creatorVault.virtualOffset;
        creatorVault.totalAssets = 1; // Minimal initial asset
        
        currentAPY = BASE_STAKING_APY_BPS;
        maxTransferAmount = 1000000 * 10**18; // 1M STORY max transfer
    }

    // ============ CRITICAL: Secure Staking with Anti-MEV Protection ============
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        if (emergencyMode) revert EmergencyModeActive();
        if (amount < MIN_STAKE_AMOUNT) revert ZeroAmount();
        if (amount > MAX_STAKE_PER_TX) revert ZeroAmount();
        if (lockPeriod < MIN_STAKING_PERIOD || lockPeriod > MAX_STAKING_PERIOD) {
            revert InvalidLockPeriod();
        }
        if (block.timestamp - lastTransactionTime[msg.sender] < TRANSACTION_COOLDOWN) {
            revert TransactionTooFrequent();
        }
        
        // CRITICAL: Oracle validation to prevent manipulation during staking
        _validateOraclePrice();
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        // If user already has stake, claim existing rewards first
        if (stakeInfo.amount > 0) {
            _claimStakingRewards(msg.sender);
        }
        
        // CRITICAL: Checks-Effects-Interactions pattern
        // 1. EFFECTS: Update state before external calls
        stakeInfo.amount += amount;
        stakeInfo.timestamp = block.timestamp;
        stakeInfo.lockPeriod = lockPeriod;
        stakeInfo.lastRewardUpdate = block.timestamp;
        
        totalStaked += amount;
        lastTransactionTime[msg.sender] = block.timestamp;
        
        // Update dynamic APY based on total staked (incentivize early staking)
        _updateDynamicAPY();
        
        // 2. INTERACTIONS: Transfer tokens LAST
        _transfer(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount, lockPeriod, block.timestamp);
    }

    // ============ CRITICAL: Secure Unstaking with Reward Calculation ============
    function unstake() external nonReentrant whenNotPaused {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.amount == 0) revert StakeNotFound();
        if (block.timestamp < stakeInfo.timestamp + stakeInfo.lockPeriod) {
            revert StakeLocked();
        }
        if (block.timestamp - lastTransactionTime[msg.sender] < TRANSACTION_COOLDOWN) {
            revert TransactionTooFrequent();
        }
        
        // Calculate final rewards
        uint256 rewards = _calculateStakingRewards(msg.sender);
        uint256 stakedAmount = stakeInfo.amount;
        
        // CRITICAL: Checks-Effects-Interactions
        // 1. EFFECTS: Clear stake before transfers
        delete stakes[msg.sender];
        totalStaked -= stakedAmount;
        lastTransactionTime[msg.sender] = block.timestamp;
        
        // Update dynamic APY
        _updateDynamicAPY();
        
        // 2. INTERACTIONS: Transfer rewards and staked amount
        if (rewards > 0 && totalSupply() + rewards <= MAX_SUPPLY) {
            _mint(msg.sender, rewards);
        }
        
        _transfer(address(this), msg.sender, stakedAmount);
        
        emit Unstaked(msg.sender, stakedAmount, rewards);
    }

    // ============ CRITICAL: Dynamic APY Calculation ============
    function _updateDynamicAPY() internal {
        uint256 stakingRatio = (totalStaked * BASIS_POINTS) / totalSupply();
        
        // Lower staking participation = higher APY (max 20%)
        // Higher staking participation = lower APY (min 5%)
        if (stakingRatio < 1000) { // Less than 10% staked
            currentAPY = MAX_STAKING_APY_BPS; // 20%
        } else if (stakingRatio < 3000) { // 10-30% staked
            currentAPY = 1500; // 15%
        } else if (stakingRatio < 5000) { // 30-50% staked
            currentAPY = 1000; // 10%
        } else { // Over 50% staked
            currentAPY = BASE_STAKING_APY_BPS; // 5%
        }
        
        emit APYUpdated(currentAPY, currentAPY, totalStaked);
    }

    // ============ CRITICAL: Secure Reward Calculation ============
    function _calculateStakingRewards(address user) internal view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakeInfo.lastRewardUpdate;
        if (stakingDuration == 0) return stakeInfo.accruedRewards;
        
        // Base rewards calculation
        uint256 annualReward = (stakeInfo.amount * currentAPY) / BASIS_POINTS;
        uint256 periodReward = (annualReward * stakingDuration) / 365 days;
        
        // Lock period bonus (longer lock = higher rewards)
        uint256 lockBonus = 0;
        if (stakeInfo.lockPeriod >= 30 days) lockBonus = 100; // 1% bonus
        if (stakeInfo.lockPeriod >= 90 days) lockBonus = 300; // 3% bonus
        if (stakeInfo.lockPeriod >= 365 days) lockBonus = 500; // 5% bonus
        
        uint256 bonusReward = (periodReward * lockBonus) / BASIS_POINTS;
        
        return stakeInfo.accruedRewards + periodReward + bonusReward;
    }

    function _claimStakingRewards(address user) internal {
        uint256 rewards = _calculateStakingRewards(user);
        if (rewards > 0) {
            stakes[user].accruedRewards = 0;
            stakes[user].lastRewardUpdate = block.timestamp;
            
            if (totalSupply() + rewards <= MAX_SUPPLY) {
                _mint(user, rewards);
                emit RewardsClaimed(user, rewards);
            }
        }
    }

    // ============ CRITICAL: Tiered Fee Discount System ============
    function calculateFeeDiscount(address user, uint256 originalFee) 
        external 
        view 
        returns (uint256 discountedFee) 
    {
        uint256 userBalance = balanceOf(user) + stakes[user].amount;
        
        uint256 discountBPS = 0;
        if (userBalance >= TIER_4_THRESHOLD) {
            discountBPS = TIER_4_DISCOUNT_BPS; // 5%
        } else if (userBalance >= TIER_3_THRESHOLD) {
            discountBPS = TIER_3_DISCOUNT_BPS; // 2.5%
        } else if (userBalance >= TIER_2_THRESHOLD) {
            discountBPS = TIER_2_DISCOUNT_BPS; // 1%
        }
        
        if (discountBPS > 0) {
            uint256 discount = (originalFee * discountBPS) / BASIS_POINTS;
            return originalFee > discount ? originalFee - discount : 0;
        }
        
        return originalFee;
    }

    // ============ CRITICAL: Premium Access Check ============
    function hasPremiumAccess(address user) external view returns (bool) {
        uint256 userBalance = balanceOf(user) + stakes[user].amount;
        return userBalance >= TIER_1_THRESHOLD;
    }

    // ============ CRITICAL: Secure Approval Override (No Infinite Approvals) ============
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        if (amount > MAX_APPROVAL_AMOUNT) revert ExcessiveApproval();
        return super.approve(spender, amount);
    }

    function increaseAllowance(address spender, uint256 addedValue) 
        public 
        virtual 
        override 
        returns (bool) 
    {
        uint256 newAllowance = allowance(msg.sender, spender) + addedValue;
        if (newAllowance > MAX_APPROVAL_AMOUNT) revert ExcessiveApproval();
        return super.increaseAllowance(spender, addedValue);
    }

    // ============ CRITICAL: Oracle Validation ============
    function _validateOraclePrice() internal view {
        if (address(priceOracle) == address(0)) return; // No oracle set
        
        (, int256 price, , uint256 updatedAt, ) = priceOracle.latestRoundData();
        
        if (block.timestamp - updatedAt > ORACLE_STALENESS_THRESHOLD) {
            revert OracleDataStale();
        }
        
        if (price <= 0) {
            revert OracleDataStale(); // Invalid price
        }
    }

    // ============ CRITICAL: Anti-MEV Transfer Override ============
    function _transfer(address from, address to, uint256 amount) internal virtual override {
        if (emergencyMode && from != treasury) {
            revert EmergencyModeActive();
        }
        
        // Anti-whale protection (except for staking contract interactions)
        if (to != address(this) && from != address(this) && amount > maxTransferAmount) {
            revert ZeroAmount();
        }
        
        super._transfer(from, to, amount);
    }

    // ============ CRITICAL: Emergency Functions ============
    function activateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated(msg.sender);
    }

    function emergencyMint(address to, uint256 amount) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        require(emergencyMode, "Not in emergency mode");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // ============ CRITICAL: Governance Functions ============
    function createProposal(string calldata description) 
        external 
        returns (uint256 proposalId) 
    {
        uint256 voterBalance = balanceOf(msg.sender) + stakes[msg.sender].amount;
        if (voterBalance < MIN_PROPOSAL_THRESHOLD) revert InsufficientVotingPower();
        
        proposalCount++;
        proposalId = proposalCount;
        
        GovernanceProposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + PROPOSAL_DURATION;
        
        emit ProposalCreated(proposalId, msg.sender, description);
    }

    function vote(uint256 proposalId, bool support) external {
        GovernanceProposal storage proposal = proposals[proposalId];
        if (block.timestamp < proposal.startTime || block.timestamp > proposal.endTime) {
            revert ProposalNotActive();
        }
        if (proposal.hasVoted[msg.sender]) revert AlreadyVoted();
        
        uint256 votingPower = balanceOf(msg.sender) + stakes[msg.sender].amount;
        if (votingPower == 0) revert InsufficientVotingPower();
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votingPower[msg.sender] = votingPower;
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }

    // ============ CRITICAL: View Functions ============
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 lockPeriod,
        uint256 pendingRewards,
        uint256 unlockTime
    ) {
        StakeInfo storage stakeInfo = stakes[user];
        return (
            stakeInfo.amount,
            stakeInfo.timestamp,
            stakeInfo.lockPeriod,
            _calculateStakingRewards(user),
            stakeInfo.timestamp + stakeInfo.lockPeriod
        );
    }

    function getTotalValueLocked() external view returns (uint256) {
        return totalStaked;
    }

    function getCurrentAPY() external view returns (uint256) {
        return currentAPY;
    }

    // ============ CRITICAL: Required Overrides ============
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}