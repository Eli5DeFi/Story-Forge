// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Treasury
 * @notice Holds protocol fees and treasury funds for Story-Forge
 * @dev Simple treasury with multi-sig style withdrawal controls
 */
contract Treasury is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

    // Withdrawal delay for large amounts (24 hours)
    uint256 public constant WITHDRAWAL_DELAY = 24 hours;
    uint256 public constant LARGE_WITHDRAWAL_THRESHOLD = 10000 * 1e6; // 10,000 USDC/USDT

    struct PendingWithdrawal {
        address token;
        address recipient;
        uint256 amount;
        uint256 executeAfter;
        bool executed;
        bool cancelled;
    }

    mapping(uint256 => PendingWithdrawal) public pendingWithdrawals;
    uint256 public withdrawalCount;

    // ============ Events ============
    event WithdrawalQueued(
        uint256 indexed withdrawalId,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 executeAfter
    );
    event WithdrawalExecuted(uint256 indexed withdrawalId, address indexed token, uint256 amount);
    event WithdrawalCancelled(uint256 indexed withdrawalId);
    event ImmediateWithdrawal(address indexed token, address indexed recipient, uint256 amount);
    event Received(address indexed from, uint256 amount);

    // ============ Errors ============
    error ZeroAddress();
    error ZeroAmount();
    error WithdrawalNotReady();
    error WithdrawalAlreadyExecuted();
    error WithdrawalCancelled();
    error InsufficientBalance();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(WITHDRAWER_ROLE, msg.sender);
    }

    /**
     * @notice Receive ETH (for any gas refunds, etc.)
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice Queue a withdrawal (required for large amounts)
     * @param token Token address to withdraw
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function queueWithdrawal(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(WITHDRAWER_ROLE) returns (uint256) {
        if (token == address(0) || recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        withdrawalCount++;
        uint256 withdrawalId = withdrawalCount;

        pendingWithdrawals[withdrawalId] = PendingWithdrawal({
            token: token,
            recipient: recipient,
            amount: amount,
            executeAfter: block.timestamp + WITHDRAWAL_DELAY,
            executed: false,
            cancelled: false
        });

        emit WithdrawalQueued(
            withdrawalId,
            token,
            recipient,
            amount,
            block.timestamp + WITHDRAWAL_DELAY
        );

        return withdrawalId;
    }

    /**
     * @notice Execute a queued withdrawal after delay
     * @param withdrawalId The withdrawal ID to execute
     */
    function executeWithdrawal(uint256 withdrawalId) external onlyRole(WITHDRAWER_ROLE) {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

        if (withdrawal.executed) revert WithdrawalAlreadyExecuted();
        if (withdrawal.cancelled) revert WithdrawalCancelled();
        if (block.timestamp < withdrawal.executeAfter) revert WithdrawalNotReady();

        withdrawal.executed = true;

        IERC20(withdrawal.token).safeTransfer(withdrawal.recipient, withdrawal.amount);

        emit WithdrawalExecuted(withdrawalId, withdrawal.token, withdrawal.amount);
    }

    /**
     * @notice Cancel a pending withdrawal
     * @param withdrawalId The withdrawal ID to cancel
     */
    function cancelWithdrawal(uint256 withdrawalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

        if (withdrawal.executed) revert WithdrawalAlreadyExecuted();

        withdrawal.cancelled = true;

        emit WithdrawalCancelled(withdrawalId);
    }

    /**
     * @notice Withdraw small amounts immediately (below threshold)
     * @param token Token address to withdraw
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawImmediate(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(WITHDRAWER_ROLE) {
        if (token == address(0) || recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        // For amounts above threshold, must use queued withdrawal
        require(amount <= LARGE_WITHDRAWAL_THRESHOLD, "Use queueWithdrawal for large amounts");

        IERC20(token).safeTransfer(recipient, amount);

        emit ImmediateWithdrawal(token, recipient, amount);
    }

    /**
     * @notice Get token balance in treasury
     * @param token Token address to check
     */
    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Get ETH balance in treasury
     */
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Emergency withdraw ETH (admin only)
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawEth(address payable recipient, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount > address(this).balance) revert InsufficientBalance();

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH transfer failed");
    }
}
