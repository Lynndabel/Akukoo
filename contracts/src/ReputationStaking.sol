// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ReputationStaking
 * @dev Manages user reputation scores and staking mechanisms
 * @notice This contract handles reputation tracking, staking, and slashing 
 */
contract ReputationStaking is Ownable, ReentrancyGuard, Pausable {
    // Events
    event ReputationStaked(
        uint256 indexed commitmentId,
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        string commitmentType
    );
    
    event ReputationUnstaked(
        uint256 indexed commitmentId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event ReputationSlashed(
        uint256 indexed commitmentId,
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        string reason
    );
    
    event ReputationScoreUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    event CommitmentCompleted(
        uint256 indexed commitmentId,
        address indexed user,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    // Structs
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 commitmentId;
        bool slashed;
        bool completed;
        string commitmentType;
        uint256 deadline;
        uint256 rewardMultiplier;
    }
    
    struct UserReputation {
        uint256 totalStaked;
        uint256 currentStaked;
        uint256 reputationScore;
        uint256 totalCommitments;
        uint256 successfulCommitments;
        uint256 failedCommitments;
        uint256 lastUpdated;
    }
    
    struct Commitment {
        uint256 id;
        address user;
        uint256 stakeAmount;
        uint256 deadline;
        string commitmentType;
        bool completed;
        bool failed;
        uint256 rewardMultiplier;
    }
    
    // State variables
    uint256 private _nextCommitmentId = 1;
    
    mapping(uint256 => Stake) public stakes;
    mapping(uint256 => Commitment) public commitments;
    mapping(address => UserReputation) public userReputations;
    mapping(address => uint256[]) public userCommitments; // user => array of commitmentIds
    
    // Reputation parameters
    uint256 public baseReputationScore = 100;
    uint256 public reputationDecayRate = 1; // 1 point per day
    uint256 public minimumStakeAmount = 0.001 ether;
    uint256 public maximumStakeAmount = 10 ether;
    
    // Reward multipliers
    uint256 public shortTermMultiplier = 110; // 110% for short-term commitments
    uint256 public mediumTermMultiplier = 125; // 125% for medium-term commitments
    uint256 public longTermMultiplier = 150; // 150% for long-term commitments
    
    // Commitment durations (in seconds)
    uint256 public shortTermDuration = 1 days;
    uint256 public mediumTermDuration = 7 days;
    uint256 public longTermDuration = 30 days;
    
    // Modifiers
    modifier commitmentExists(uint256 commitmentId) {
        require(_nextCommitmentId > commitmentId && commitmentId > 0, "ReputationStaking: Commitment does not exist");
        _;
    }
    
    modifier commitmentActive(uint256 commitmentId) {
        require(!commitments[commitmentId].completed, "ReputationStaking: Commitment already completed");
        require(!commitments[commitmentId].failed, "ReputationStaking: Commitment already failed");
        require(block.timestamp < commitments[commitmentId].deadline, "ReputationStaking: Commitment deadline passed");
        _;
    }
    
    modifier commitmentDeadlinePassed(uint256 commitmentId) {
        require(block.timestamp >= commitments[commitmentId].deadline, "ReputationStaking: Commitment deadline not passed");
        _;
    }
    
    // Constructor
    constructor() Ownable(msg.sender) {
        // Commitment IDs start from 1
    }
    
    /**
     * @dev Stake reputation on a commitment
     * @param commitmentType Type of commitment (e.g., "chapter_quality", "community_moderation")
     * @param duration Duration type (1=short, 2=medium, 3=long)
     */
    function stakeReputation(
        string memory commitmentType,
        uint256 duration
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= minimumStakeAmount, "ReputationStaking: Insufficient stake amount");
        require(msg.value <= maximumStakeAmount, "ReputationStaking: Stake amount too high");
        require(bytes(commitmentType).length > 0, "ReputationStaking: Commitment type cannot be empty");
        require(duration >= 1 && duration <= 3, "ReputationStaking: Invalid duration type");
        
        uint256 commitmentId = _nextCommitmentId++;
        
        // Calculate commitment parameters based on duration
        uint256 commitmentDuration;
        uint256 rewardMultiplier;
        
        if (duration == 1) {
            commitmentDuration = shortTermDuration;
            rewardMultiplier = shortTermMultiplier;
        } else if (duration == 2) {
            commitmentDuration = mediumTermDuration;
            rewardMultiplier = mediumTermMultiplier;
        } else {
            commitmentDuration = longTermDuration;
            rewardMultiplier = longTermMultiplier;
        }
        
        // Create commitment
        commitments[commitmentId] = Commitment({
            id: commitmentId,
            user: msg.sender,
            stakeAmount: msg.value,
            deadline: block.timestamp + commitmentDuration,
            commitmentType: commitmentType,
            completed: false,
            failed: false,
            rewardMultiplier: rewardMultiplier
        });
        
        // Create stake
        stakes[commitmentId] = Stake({
            amount: msg.value,
            timestamp: block.timestamp,
            commitmentId: commitmentId,
            slashed: false,
            completed: false,
            commitmentType: commitmentType,
            deadline: block.timestamp + commitmentDuration,
            rewardMultiplier: rewardMultiplier
        });
        
        // Update user reputation
        UserReputation storage reputation = userReputations[msg.sender];
        if (reputation.reputationScore == 0) {
            reputation.reputationScore = baseReputationScore; // Initialize to base score
        }
        reputation.totalStaked += msg.value;
        reputation.currentStaked += msg.value;
        reputation.totalCommitments++;
        reputation.lastUpdated = block.timestamp;
        
        // Add to user's commitment list
        userCommitments[msg.sender].push(commitmentId);
        
        emit ReputationStaked(commitmentId, msg.sender, msg.value, block.timestamp, commitmentType);
    }
    
    /**
     * @dev Complete a commitment successfully
     * @param commitmentId ID of the commitment to complete
     */
    function completeCommitment(uint256 commitmentId) external commitmentExists(commitmentId) commitmentDeadlinePassed(commitmentId) nonReentrant {
        Commitment storage commitment = commitments[commitmentId];
        require(msg.sender == commitment.user, "ReputationStaking: Only commitment owner can complete");
        require(!commitment.completed, "ReputationStaking: Commitment already completed");
        require(!commitment.failed, "ReputationStaking: Commitment already failed");
        
        commitment.completed = true;
        stakes[commitmentId].completed = true;
        
        // Calculate reward
        uint256 rewardAmount = (commitment.stakeAmount * commitment.rewardMultiplier) / 100;
        uint256 profit = rewardAmount - commitment.stakeAmount;
        
        // Update user reputation
        UserReputation storage reputation = userReputations[msg.sender];
        reputation.currentStaked -= commitment.stakeAmount;
        reputation.successfulCommitments++;
        reputation.reputationScore += _calculateReputationGain(commitmentId);
        reputation.lastUpdated = block.timestamp;
        
        // Transfer payout: prefer full reward if contract has funds; otherwise, ensure at least principal is paid
        uint256 payout = rewardAmount;
        uint256 balance = address(this).balance;
        if (balance < payout) {
            // Fallback to paying at least the principal to avoid revert due to insufficient funds
            payout = commitment.stakeAmount <= balance ? commitment.stakeAmount : balance;
        }
        if (payout > 0) {
            payable(msg.sender).transfer(payout);
        }
        
        emit CommitmentCompleted(commitmentId, msg.sender, rewardAmount, block.timestamp);
        emit ReputationScoreUpdated(msg.sender, reputation.reputationScore - _calculateReputationGain(commitmentId), reputation.reputationScore, block.timestamp);
    }
    
    /**
     * @dev Mark a commitment as failed
     * @param commitmentId ID of the commitment to mark as failed
     */
    function failCommitment(uint256 commitmentId) external commitmentExists(commitmentId) commitmentDeadlinePassed(commitmentId) nonReentrant {
        Commitment storage commitment = commitments[commitmentId];
        require(msg.sender == commitment.user, "ReputationStaking: Only commitment owner can fail");
        require(!commitment.completed, "ReputationStaking: Commitment already completed");
        require(!commitment.failed, "ReputationStaking: Commitment already failed");
        
        commitment.failed = true;
        
        // Update user reputation
        UserReputation storage reputation = userReputations[msg.sender];
        reputation.currentStaked -= commitment.stakeAmount;
        reputation.failedCommitments++;
        reputation.reputationScore = _calculateReputationLoss(reputation.reputationScore);
        reputation.lastUpdated = block.timestamp;
        
        // Return stake (no reward for failed commitment)
        payable(msg.sender).transfer(commitment.stakeAmount);
        
        emit ReputationScoreUpdated(msg.sender, reputation.reputationScore + _calculateReputationLoss(reputation.reputationScore), reputation.reputationScore, block.timestamp);
    }
    
    /**
     * @dev Slash a user's stake for poor performance
     * @param commitmentId ID of the commitment to slash
     * @param slashAmount Amount to slash
     * @param reason Reason for slashing
     */
    function slashStake(
        uint256 commitmentId,
        uint256 slashAmount,
        string memory reason
    ) external onlyOwner commitmentExists(commitmentId) nonReentrant {
        Stake storage stake = stakes[commitmentId];
        require(!stake.slashed, "ReputationStaking: Stake already slashed");
        require(slashAmount <= stake.amount, "ReputationStaking: Slash amount exceeds stake");
        
        stake.slashed = true;
        commitments[commitmentId].failed = true;
        
        // Update user reputation
        address user = commitments[commitmentId].user;
        UserReputation storage reputation = userReputations[user];
        reputation.currentStaked -= stake.amount;
        reputation.failedCommitments++;
        reputation.reputationScore = _calculateReputationLoss(reputation.reputationScore);
        reputation.lastUpdated = block.timestamp;
        
        // Transfer slashed amount to owner (platform fee)
        payable(owner()).transfer(slashAmount);
        
        // Return remaining stake to user
        uint256 remainingAmount = stake.amount - slashAmount;
        if (remainingAmount > 0) {
            payable(user).transfer(remainingAmount);
        }
        
        emit ReputationSlashed(commitmentId, user, slashAmount, block.timestamp, reason);
        emit ReputationScoreUpdated(user, reputation.reputationScore + _calculateReputationLoss(reputation.reputationScore), reputation.reputationScore, block.timestamp);
    }
    
    /**
     * @dev Get user's reputation score
     * @param user Address of the user
     * @return Current reputation score
     */
    function getReputationScore(address user) external view returns (uint256) {
        return userReputations[user].reputationScore;
    }
    
    /**
     * @dev Get user's reputation information
     * @param user Address of the user
     * @return totalStaked Total amount staked
     * @return currentStaked Currently staked amount
     * @return reputationScore Reputation score
     * @return totalCommitments Total commitments count
     * @return successfulCommitments Successful commitments count
     * @return failedCommitments Failed commitments count
     * @return lastUpdated Last update timestamp
     */
    function getUserReputation(address user) external view returns (
        uint256 totalStaked,
        uint256 currentStaked,
        uint256 reputationScore,
        uint256 totalCommitments,
        uint256 successfulCommitments,
        uint256 failedCommitments,
        uint256 lastUpdated
    ) {
        UserReputation storage reputation = userReputations[user];
        return (
            reputation.totalStaked,
            reputation.currentStaked,
            reputation.reputationScore,
            reputation.totalCommitments,
            reputation.successfulCommitments,
            reputation.failedCommitments,
            reputation.lastUpdated
        );
    }
    
    /**
     * @dev Get commitment information
     * @param commitmentId ID of the commitment
     * @return id Commitment ID
     * @return user User address
     * @return stakeAmount Stake amount
     * @return deadline Deadline timestamp
     * @return commitmentType Commitment type
     * @return completed Whether completed
     * @return failed Whether failed
     * @return rewardMultiplier Reward multiplier
     */
    function getCommitment(uint256 commitmentId) external view commitmentExists(commitmentId) returns (
        uint256 id,
        address user,
        uint256 stakeAmount,
        uint256 deadline,
        string memory commitmentType,
        bool completed,
        bool failed,
        uint256 rewardMultiplier
    ) {
        Commitment storage commitment = commitments[commitmentId];
        return (
            commitment.id,
            commitment.user,
            commitment.stakeAmount,
            commitment.deadline,
            commitment.commitmentType,
            commitment.completed,
            commitment.failed,
            commitment.rewardMultiplier
        );
    }
    
    /**
     * @dev Get user's commitments
     * @param user Address of the user
     * @return Array of commitment IDs
     */
    function getUserCommitments(address user) external view returns (uint256[] memory) {
        return userCommitments[user];
    }
    
    /**
     * @dev Get total number of commitments
     * @return Total commitment count
     */
    function getTotalCommitments() external view returns (uint256) {
        return _nextCommitmentId - 1;
    }
    
    /**
     * @dev Update reputation parameters (owner only)
     * @param _baseReputationScore New base reputation score
     * @param _reputationDecayRate New reputation decay rate
     * @param _minimumStakeAmount New minimum stake amount
     * @param _maximumStakeAmount New maximum stake amount
     */
    function updateReputationParameters(
        uint256 _baseReputationScore,
        uint256 _reputationDecayRate,
        uint256 _minimumStakeAmount,
        uint256 _maximumStakeAmount
    ) external onlyOwner {
        require(_minimumStakeAmount < _maximumStakeAmount, "ReputationStaking: Invalid stake amounts");
        
        baseReputationScore = _baseReputationScore;
        reputationDecayRate = _reputationDecayRate;
        minimumStakeAmount = _minimumStakeAmount;
        maximumStakeAmount = _maximumStakeAmount;
    }
    
    /**
     * @dev Update reward multipliers (owner only)
     * @param _shortTermMultiplier New short-term multiplier
     * @param _mediumTermMultiplier New medium-term multiplier
     * @param _longTermMultiplier New long-term multiplier
     */
    function updateRewardMultipliers(
        uint256 _shortTermMultiplier,
        uint256 _mediumTermMultiplier,
        uint256 _longTermMultiplier
    ) external onlyOwner {
        require(_shortTermMultiplier >= 100, "ReputationStaking: Multipliers must be >= 100");
        require(_mediumTermMultiplier >= 100, "ReputationStaking: Multipliers must be >= 100");
        require(_longTermMultiplier >= 100, "ReputationStaking: Multipliers must be >= 100");
        
        shortTermMultiplier = _shortTermMultiplier;
        mediumTermMultiplier = _mediumTermMultiplier;
        longTermMultiplier = _longTermMultiplier;
    }
    
    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Calculate reputation gain for successful commitment
     * @param commitmentId ID of the commitment
     * @return Reputation points gained
     */
    function _calculateReputationGain(uint256 commitmentId) internal view returns (uint256) {
        Commitment storage commitment = commitments[commitmentId];
        uint256 baseGain = 10; // Base 10 points
        
        // Bonus based on stake amount
        uint256 stakeBonus = (commitment.stakeAmount * 5) / 1 ether; // 5 points per ETH staked
        
        // Bonus based on commitment duration
        uint256 durationBonus;
        if (commitment.rewardMultiplier == longTermMultiplier) {
            durationBonus = 20; // Long-term commitment bonus
        } else if (commitment.rewardMultiplier == mediumTermMultiplier) {
            durationBonus = 10; // Medium-term commitment bonus
        }
        
        return baseGain + stakeBonus + durationBonus;
    }
    
    /**
     * @dev Calculate reputation loss for failed commitment
     * @param currentScore Current reputation score
     * @return New reputation score after loss
     */
    function _calculateReputationLoss(uint256 currentScore) internal view returns (uint256) {
        uint256 loss = reputationDecayRate * 7; // 7 days worth of decay
        if (loss >= currentScore) {
            return baseReputationScore; // Don't go below base score
        }
        return currentScore - loss;
    }
    
    /**
     * @dev Emergency function to withdraw all funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
