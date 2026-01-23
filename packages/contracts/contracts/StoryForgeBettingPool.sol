// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StoryForgeBettingPool
 * @notice Handles prediction market betting for Story-Forge chapters
 * @dev Winner-takes-all system with 2% fee and 85/15 winner/treasury split
 */
contract StoryForgeBettingPool is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant FEE_PERCENTAGE = 200; // 2% = 200 basis points
    uint256 public constant WINNER_PERCENTAGE = 8500; // 85% = 8500 basis points
    uint256 public constant TREASURY_PERCENTAGE = 1500; // 15% = 1500 basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_OUTCOMES = 5;

    // ============ Structs ============
    struct Pool {
        uint256 chapterId;
        uint256 totalDeposits;
        uint256 carryoverAmount;
        uint256 bettingEndsAt;
        address tokenAddress;
        bool isResolved;
        uint256 winningOutcome;
        bool exists;
    }

    struct UserBet {
        uint256 amount;
        bool claimed;
    }

    // ============ State Variables ============
    address public treasury;
    address public oracleAddress;

    mapping(address => bool) public acceptedTokens;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(uint256 => uint256)) public outcomeDeposits; // poolId => outcome => deposits
    mapping(uint256 => mapping(uint256 => uint256)) public outcomeVoterCount; // poolId => outcome => count
    mapping(address => mapping(uint256 => mapping(uint256 => UserBet))) public userBets; // user => poolId => outcome => bet

    uint256 public poolCounter;

    // ============ Events ============
    event PoolCreated(
        uint256 indexed poolId,
        uint256 indexed chapterId,
        uint256 bettingEndsAt,
        address tokenAddress
    );
    event BetPlaced(
        address indexed user,
        uint256 indexed poolId,
        uint256 outcomeId,
        uint256 amount,
        uint256 feeDeducted
    );
    event OutcomeResolved(uint256 indexed poolId, uint256 winningOutcome);
    event WinningsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event CarryoverTransferred(uint256 fromPoolId, uint256 toPoolId, uint256 amount);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event OracleUpdated(address oldOracle, address newOracle);
    event TokenAcceptanceChanged(address token, bool accepted);

    // ============ Errors ============
    error PoolDoesNotExist();
    error BettingPeriodEnded();
    error BettingPeriodNotEnded();
    error InvalidOutcome();
    error AmountMustBePositive();
    error TokenNotAccepted();
    error PoolAlreadyResolved();
    error PoolNotResolved();
    error NothingToClaim();
    error OnlyOracle();
    error PreviousPoolNotResolved();
    error ZeroAddress();

    // ============ Modifiers ============
    modifier onlyOracle() {
        if (msg.sender != oracleAddress) revert OnlyOracle();
        _;
    }

    modifier poolExists(uint256 poolId) {
        if (!pools[poolId].exists) revert PoolDoesNotExist();
        _;
    }

    // ============ Initialization ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _treasury,
        address _oracle,
        address _usdc,
        address _usdt
    ) public initializer {
        if (_treasury == address(0) || _oracle == address(0)) revert ZeroAddress();

        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        treasury = _treasury;
        oracleAddress = _oracle;

        if (_usdc != address(0)) acceptedTokens[_usdc] = true;
        if (_usdt != address(0)) acceptedTokens[_usdt] = true;
    }

    // ============ Pool Management ============

    /**
     * @notice Creates a new betting pool for a chapter
     * @param chapterId The chapter ID this pool is for
     * @param bettingDuration Duration in seconds for betting period
     * @param tokenAddress The stablecoin address (USDC/USDT)
     * @param carryoverFromPool Previous pool ID to carry over from (0 if none)
     */
    function createPool(
        uint256 chapterId,
        uint256 bettingDuration,
        address tokenAddress,
        uint256 carryoverFromPool
    ) external onlyOwner returns (uint256) {
        if (!acceptedTokens[tokenAddress]) revert TokenNotAccepted();

        poolCounter++;
        Pool storage pool = pools[poolCounter];
        pool.chapterId = chapterId;
        pool.bettingEndsAt = block.timestamp + bettingDuration;
        pool.tokenAddress = tokenAddress;
        pool.exists = true;

        // Handle carryover from previous pool
        if (carryoverFromPool > 0) {
            Pool storage prevPool = pools[carryoverFromPool];
            if (!prevPool.isResolved) revert PreviousPoolNotResolved();

            pool.carryoverAmount = prevPool.carryoverAmount;
            prevPool.carryoverAmount = 0; // Clear the carryover

            emit CarryoverTransferred(carryoverFromPool, poolCounter, pool.carryoverAmount);
        }

        emit PoolCreated(poolCounter, chapterId, pool.bettingEndsAt, tokenAddress);
        return poolCounter;
    }

    // ============ Betting Functions ============

    /**
     * @notice Place a bet on a specific outcome
     * @param poolId The pool to bet on
     * @param outcomeId The outcome option (1-5)
     * @param amount Amount to bet (before fee deduction)
     */
    function placeBet(
        uint256 poolId,
        uint256 outcomeId,
        uint256 amount
    ) external nonReentrant whenNotPaused poolExists(poolId) {
        Pool storage pool = pools[poolId];

        if (block.timestamp >= pool.bettingEndsAt) revert BettingPeriodEnded();
        if (outcomeId < 1 || outcomeId > MAX_OUTCOMES) revert InvalidOutcome();
        if (amount == 0) revert AmountMustBePositive();

        IERC20 token = IERC20(pool.tokenAddress);

        // Calculate fee (2%)
        uint256 fee = (amount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 netAmount = amount - fee;

        // Transfer tokens from user
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Transfer fee to treasury immediately
        token.safeTransfer(treasury, fee);

        // Update pool state
        pool.totalDeposits += netAmount;
        outcomeDeposits[poolId][outcomeId] += netAmount;

        // Track if this is a new voter for this outcome
        if (userBets[msg.sender][poolId][outcomeId].amount == 0) {
            outcomeVoterCount[poolId][outcomeId]++;
        }

        // Record user bet (accumulate if betting multiple times on same outcome)
        userBets[msg.sender][poolId][outcomeId].amount += netAmount;

        emit BetPlaced(msg.sender, poolId, outcomeId, netAmount, fee);
    }

    // ============ Resolution Functions ============

    /**
     * @notice Resolve the pool with the winning outcome (called by oracle)
     * @param poolId The pool to resolve
     * @param winningOutcome The winning outcome (1-5)
     */
    function resolvePool(
        uint256 poolId,
        uint256 winningOutcome
    ) external onlyOracle nonReentrant poolExists(poolId) {
        Pool storage pool = pools[poolId];

        if (pool.isResolved) revert PoolAlreadyResolved();
        if (block.timestamp < pool.bettingEndsAt) revert BettingPeriodNotEnded();
        if (winningOutcome < 1 || winningOutcome > MAX_OUTCOMES) revert InvalidOutcome();

        pool.isResolved = true;
        pool.winningOutcome = winningOutcome;

        uint256 winningDeposits = outcomeDeposits[poolId][winningOutcome];
        uint256 totalPrize = pool.totalDeposits + pool.carryoverAmount;

        // If no one bet on winning outcome, set carryover for next pool
        if (winningDeposits == 0) {
            pool.carryoverAmount = totalPrize;
        } else {
            // Calculate treasury cut from prize pool
            uint256 treasuryCut = (totalPrize * TREASURY_PERCENTAGE) / BASIS_POINTS;
            IERC20(pool.tokenAddress).safeTransfer(treasury, treasuryCut);
            pool.carryoverAmount = 0;
        }

        emit OutcomeResolved(poolId, winningOutcome);
    }

    // ============ Claim Functions ============

    /**
     * @notice Claim winnings for a resolved pool
     * @param poolId The pool to claim from
     */
    function claimWinnings(uint256 poolId) external nonReentrant poolExists(poolId) {
        Pool storage pool = pools[poolId];

        if (!pool.isResolved) revert PoolNotResolved();

        UserBet storage bet = userBets[msg.sender][poolId][pool.winningOutcome];

        if (bet.amount == 0 || bet.claimed) revert NothingToClaim();

        bet.claimed = true;

        // Calculate proportional share
        uint256 totalPrize = pool.totalDeposits + pool.carryoverAmount;
        uint256 winnerPool = (totalPrize * WINNER_PERCENTAGE) / BASIS_POINTS;
        uint256 winningDeposits = outcomeDeposits[poolId][pool.winningOutcome];
        uint256 share = (bet.amount * winnerPool) / winningDeposits;

        IERC20(pool.tokenAddress).safeTransfer(msg.sender, share);

        emit WinningsClaimed(msg.sender, poolId, share);
    }

    /**
     * @notice Claim winnings for multiple outcomes (if user bet on winning outcome multiple ways)
     * @param poolId The pool to claim from
     */
    function claimAllWinnings(uint256 poolId) external nonReentrant poolExists(poolId) {
        Pool storage pool = pools[poolId];

        if (!pool.isResolved) revert PoolNotResolved();

        uint256 totalClaim = 0;
        uint256 winningOutcome = pool.winningOutcome;

        UserBet storage bet = userBets[msg.sender][poolId][winningOutcome];

        if (bet.amount > 0 && !bet.claimed) {
            bet.claimed = true;

            uint256 totalPrize = pool.totalDeposits + pool.carryoverAmount;
            uint256 winnerPool = (totalPrize * WINNER_PERCENTAGE) / BASIS_POINTS;
            uint256 winningDeposits = outcomeDeposits[poolId][winningOutcome];
            totalClaim = (bet.amount * winnerPool) / winningDeposits;
        }

        if (totalClaim == 0) revert NothingToClaim();

        IERC20(pool.tokenAddress).safeTransfer(msg.sender, totalClaim);

        emit WinningsClaimed(msg.sender, poolId, totalClaim);
    }

    // ============ View Functions ============

    function getPoolInfo(uint256 poolId) external view returns (
        uint256 chapterId,
        uint256 totalDeposits,
        uint256 carryoverAmount,
        uint256 bettingEndsAt,
        address tokenAddress,
        bool isResolved,
        uint256 winningOutcome
    ) {
        Pool storage pool = pools[poolId];
        return (
            pool.chapterId,
            pool.totalDeposits,
            pool.carryoverAmount,
            pool.bettingEndsAt,
            pool.tokenAddress,
            pool.isResolved,
            pool.winningOutcome
        );
    }

    function getOutcomeDeposits(uint256 poolId, uint256 outcomeId) external view returns (uint256) {
        return outcomeDeposits[poolId][outcomeId];
    }

    function getOutcomeVoterCount(uint256 poolId, uint256 outcomeId) external view returns (uint256) {
        return outcomeVoterCount[poolId][outcomeId];
    }

    function getUserBet(address user, uint256 poolId, uint256 outcomeId) external view returns (uint256 amount, bool claimed) {
        UserBet storage bet = userBets[user][poolId][outcomeId];
        return (bet.amount, bet.claimed);
    }

    function calculatePotentialWinnings(
        uint256 poolId,
        uint256 outcomeId,
        uint256 betAmount
    ) external view returns (uint256) {
        Pool storage pool = pools[poolId];

        uint256 netBet = betAmount - (betAmount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 outcomeTotal = outcomeDeposits[poolId][outcomeId] + netBet;
        uint256 totalPrize = pool.totalDeposits + pool.carryoverAmount + netBet;
        uint256 winnerPool = (totalPrize * WINNER_PERCENTAGE) / BASIS_POINTS;

        return (netBet * winnerPool) / outcomeTotal;
    }

    // ============ Admin Functions ============

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert ZeroAddress();
        emit OracleUpdated(oracleAddress, _oracle);
        oracleAddress = _oracle;
    }

    function setTokenAcceptance(address token, bool accepted) external onlyOwner {
        acceptedTokens[token] = accepted;
        emit TokenAcceptanceChanged(token, accepted);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
