// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StoryNFT.sol";

/**
 * @title StoryTreasury
 * @dev Manages revenue distribution and financial operations for the story platform
 * @notice This contract handles the distribution of funds from NFT sales and platform fees
 */
contract StoryTreasury is Ownable, ReentrancyGuard {
    // Events
    event RevenueReceived(
        uint256 indexed tokenId,
        uint256 indexed storyId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );
    
    event RevenueDistributed(
        uint256 indexed tokenId,
        address indexed author,
        uint256 authorAmount,
        uint256 voterAmount,
        uint256 platformAmount,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    
    // Structs
    struct RevenueShare {
        uint256 authorShare;      // Author's share of revenue
        uint256 voterShare;       // Voters' share of revenue
        uint256 platformShare;    // Platform's share of revenue
        uint256 totalAmount;      // Total revenue amount
        bool distributed;         // Whether revenue has been distributed
        uint256 timestamp;        // When revenue was received
    }
    
    struct UserRewards {
        uint256 pendingAmount;    // Amount pending to be claimed
        uint256 totalEarned;      // Total amount earned historically
        uint256 lastClaimed;      // Last time rewards were claimed
    }
    
    // State variables
    uint256 private _nextRevenueId = 1;
    
    mapping(uint256 => RevenueShare) public revenueShares;
    mapping(address => UserRewards) public userRewards;
    mapping(uint256 => uint256[]) public storyRevenue; // storyId => array of revenueIds
    
    // Revenue sharing percentages (basis points: 10000 = 100%)
    uint256 public authorSharePercentage = 6000;      // 60%
    uint256 public voterSharePercentage = 3000;       // 30%
    uint256 public platformSharePercentage = 1000;    // 10%
    
    // Platform fee for NFT sales
    uint256 public platformFee = 250; // 2.5% (250 basis points)
    
    // Minimum amount to trigger distribution
    uint256 public minimumDistributionAmount = 0.01 ether;
    
    // Contract references
    StoryNFT public storyNFT;
    
    // Modifiers
    modifier revenueExists(uint256 revenueId) {
        require(_nextRevenueId > revenueId && revenueId > 0, "StoryTreasury: Revenue does not exist");
        _;
    }
    
    modifier revenueNotDistributed(uint256 revenueId) {
        require(!revenueShares[revenueId].distributed, "StoryTreasury: Revenue already distributed");
        _;
    }
    
    // Constructor
    constructor(address _storyNFT) Ownable(msg.sender) {
        storyNFT = StoryNFT(_storyNFT);
        // Revenue IDs start from 1
    }
    
    /**
     * @dev Receive revenue from NFT sales
     * @param tokenId ID of the NFT
     * @param storyId ID of the story
     * @param buyer Address of the buyer
     */
    function receiveRevenue(
        uint256 tokenId,
        uint256 storyId,
        address buyer
    ) external payable nonReentrant {
        require(msg.value > 0, "StoryTreasury: Revenue amount must be positive");
        
        uint256 revenueId = _nextRevenueId++;
        
        // Calculate platform fee
        uint256 platformFeeAmount = (msg.value * platformFee) / 10000;
        uint256 netRevenue = msg.value - platformFeeAmount;
        
        // Calculate revenue shares
        uint256 authorAmount = (netRevenue * authorSharePercentage) / 10000;
        uint256 voterAmount = (netRevenue * voterSharePercentage) / 10000;
        uint256 remainingPlatformAmount = netRevenue - authorAmount - voterAmount;
        
        revenueShares[revenueId] = RevenueShare({
            authorShare: authorAmount,
            voterShare: voterAmount,
            platformShare: platformFeeAmount + remainingPlatformAmount,
            totalAmount: msg.value,
            distributed: false,
            timestamp: block.timestamp
        });
        
        // Add to story's revenue list
        storyRevenue[storyId].push(revenueId);
        
        emit RevenueReceived(tokenId, storyId, buyer, msg.value, block.timestamp);
    }
    
    /**
     * @dev Distribute revenue to stakeholders
     * @param revenueId ID of the revenue to distribute
     */
    function distributeRevenue(uint256 revenueId) external revenueExists(revenueId) revenueNotDistributed(revenueId) nonReentrant {
        RevenueShare storage revenue = revenueShares[revenueId];
        require(revenue.totalAmount >= minimumDistributionAmount, "StoryTreasury: Amount too small for distribution");
        
        // Mark as distributed
        revenue.distributed = true;
        
        // Get the story and chapter information
        uint256 storyId = _getStoryIdFromRevenue(revenueId);
        uint256 tokenId = _getTokenIdFromRevenue(revenueId);
        
        if (storyId > 0 && tokenId > 0) {
            // Get chapter information
            StoryNFT.Chapter memory chapter = storyNFT.getChapter(tokenId);
            address author = chapter.author;
            
            // Distribute author share
            if (revenue.authorShare > 0) {
                payable(author).transfer(revenue.authorShare);
                _updateUserRewards(author, revenue.authorShare);
            }
            
            // Distribute voter share (this would need to be implemented based on voting history)
            if (revenue.voterShare > 0) {
                _distributeVoterRewards(storyId, revenue.voterShare);
            }
            
            // Platform share remains in contract
            emit RevenueDistributed(
                tokenId,
                author,
                revenue.authorShare,
                revenue.voterShare,
                revenue.platformShare,
                block.timestamp
            );
        }
    }
    
    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        UserRewards storage rewards = userRewards[msg.sender];
        require(rewards.pendingAmount > 0, "StoryTreasury: No rewards to claim");
        
        uint256 amount = rewards.pendingAmount;
        rewards.pendingAmount = 0;
        rewards.lastClaimed = block.timestamp;
        
        payable(msg.sender).transfer(amount);
        
        emit RewardsClaimed(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get user's pending rewards
     * @param user Address of the user
     * @return Pending reward amount
     */
    function getPendingRewards(address user) external view returns (uint256) {
        return userRewards[user].pendingAmount;
    }
    
    /**
     * @dev Get user's total earned rewards
     * @param user Address of the user
     * @return Total earned amount
     */
    function getTotalEarned(address user) external view returns (uint256) {
        return userRewards[user].totalEarned;
    }
    
    /**
     * @dev Get revenue share information
     * @param revenueId ID of the revenue
     * @return authorShare Author's share amount
     * @return voterShare Voter's share amount
     * @return platformShare Platform's share amount
     * @return totalAmount Total revenue amount
     * @return distributed Whether distributed
     * @return timestamp When received
     */
    function getRevenueShare(uint256 revenueId) external view revenueExists(revenueId) returns (
        uint256 authorShare,
        uint256 voterShare,
        uint256 platformShare,
        uint256 totalAmount,
        bool distributed,
        uint256 timestamp
    ) {
        RevenueShare storage revenue = revenueShares[revenueId];
        return (
            revenue.authorShare,
            revenue.voterShare,
            revenue.platformShare,
            revenue.totalAmount,
            revenue.distributed,
            revenue.timestamp
        );
    }
    
    /**
     * @dev Get all revenue for a story
     * @param storyId ID of the story
     * @return Array of revenue IDs
     */
    function getStoryRevenue(uint256 storyId) external view returns (uint256[] memory) {
        return storyRevenue[storyId];
    }
    
    /**
     * @dev Get total number of revenue entries
     * @return Total revenue count
     */
    function getTotalRevenue() external view returns (uint256) {
        return _nextRevenueId - 1;
    }
    
    /**
     * @dev Update revenue sharing percentages (owner only)
     * @param _authorShare New author share percentage (basis points)
     * @param _voterShare New voter share percentage (basis points)
     * @param _platformShare New platform share percentage (basis points)
     */
    function updateRevenueShares(
        uint256 _authorShare,
        uint256 _voterShare,
        uint256 _platformShare
    ) external onlyOwner {
        require(_authorShare + _voterShare + _platformShare == 10000, "StoryTreasury: Shares must equal 100%");
        require(_authorShare > 0, "StoryTreasury: Author share must be positive");
        require(_voterShare > 0, "StoryTreasury: Voter share must be positive");
        require(_platformShare > 0, "StoryTreasury: Platform share must be positive");
        
        authorSharePercentage = _authorShare;
        voterSharePercentage = _voterShare;
        platformSharePercentage = _platformShare;
    }
    
    /**
     * @dev Update platform fee (owner only)
     * @param _platformFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "StoryTreasury: Platform fee cannot exceed 10%");
        
        uint256 oldFee = platformFee;
        platformFee = _platformFee;
        
        emit PlatformFeeUpdated(oldFee, _platformFee, block.timestamp);
    }
    
    /**
     * @dev Update minimum distribution amount (owner only)
     * @param _minimumAmount New minimum amount
     */
    function updateMinimumDistributionAmount(uint256 _minimumAmount) external onlyOwner {
        minimumDistributionAmount = _minimumAmount;
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     * @param amount Amount to withdraw
     */
    function withdrawPlatformFees(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "StoryTreasury: Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Update user rewards
     * @param user Address of the user
     * @param amount Amount to add to rewards
     */
    function _updateUserRewards(address user, uint256 amount) internal {
        userRewards[user].pendingAmount += amount;
        userRewards[user].totalEarned += amount;
    }
    
    /**
     * @dev Distribute rewards to voters (placeholder implementation)
     * @param storyId ID of the story
     * @param totalAmount Total amount to distribute
     */
    function _distributeVoterRewards(uint256 storyId, uint256 totalAmount) internal {
        // This is a placeholder implementation
        // In a real implementation, you would:
        // 1. Get all voters for the story
        // 2. Calculate their voting weight
        // 3. Distribute rewards proportionally
        
        // For now, we'll just keep the voter share in the contract
        // This can be implemented later with a more sophisticated voting reward system
    }
    
    /**
     * @dev Get story ID from revenue ID (placeholder implementation)
     * @param revenueId ID of the revenue
     * @return Story ID
     */
    function _getStoryIdFromRevenue(uint256 revenueId) internal view returns (uint256) {
        // This would need to be implemented based on how revenue is tracked
        // For now, return 0 as placeholder
        return 0;
    }
    
    /**
     * @dev Get token ID from revenue ID (placeholder implementation)
     * @param revenueId ID of the revenue
     * @return Token ID
     */
    function _getTokenIdFromRevenue(uint256 revenueId) internal view returns (uint256) {
        // This would need to be implemented based on how revenue is tracked
        // For now, return 0 as placeholder
        return 0;
    }
    
    /**
     * @dev Emergency function to withdraw all funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Allow the contract to receive ETH
    }
}
