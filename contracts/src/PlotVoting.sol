// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./StoryNFT.sol";

/**
 * @title PlotVoting
 * @dev Manages chapter proposals and voting for story chapters
 * @notice This contract handles the democratic process of choosing story directions
 */
contract PlotVoting is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Events
    event ProposalSubmitted(
        uint256 indexed proposalId,
        address indexed author,
        uint256 indexed storyId,
        string contentHash,
        uint256 stakeAmount,
        uint256 deadline
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 amount,
        uint256 totalVotes
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        uint256 indexed storyId,
        address indexed author,
        uint256 tokenId
    );
    
    event ProposalRejected(
        uint256 indexed proposalId,
        uint256 indexed storyId,
        address indexed author
    );
    
    // Structs
    struct Proposal {
        uint256 storyId;
        address author;
        string contentHash;
        uint256 chapterNumber;
        uint256 voteCount;
        uint256 stakeAmount;
        uint256 deadline;
        bool executed;
        bool rejected;
        uint256 totalVoters;
        mapping(address => uint256) votes; // voter => vote amount
        mapping(address => bool) hasVoted; // voter => has voted
    }
    
    struct VoteInfo {
        uint256 amount;
        uint256 timestamp;
    }
    
    // State variables
    Counters.Counter private _proposalIds;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public storyProposals; // storyId => array of proposalIds
    
    // Voting parameters
    uint256 public votingDuration = 7 days;
    uint256 public minimumStake = 0.01 ether;
    uint256 public minimumVotesToExecute = 10;
    
    // Contract references
    StoryNFT public storyNFT;
    
    // Modifiers
    modifier proposalExists(uint256 proposalId) {
        require(_proposalIds.current() >= proposalId && proposalId > 0, "PlotVoting: Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(!proposals[proposalId].executed, "PlotVoting: Proposal already executed");
        require(!proposals[proposalId].rejected, "PlotVoting: Proposal already rejected");
        require(block.timestamp < proposals[proposalId].deadline, "PlotVoting: Voting period ended");
        _;
    }
    
    modifier votingEnded(uint256 proposalId) {
        require(block.timestamp >= proposals[proposalId].deadline, "PlotVoting: Voting still active");
        _;
    }
    
    // Constructor
    constructor(address _storyNFT) {
        storyNFT = StoryNFT(_storyNFT);
        _proposalIds.increment(); // Start from 1
    }
    
    /**
     * @dev Submit a new chapter proposal
     * @param storyId ID of the story
     * @param contentHash IPFS hash of the chapter content
     * @param chapterNumber Chapter number in the story
     * @param metadataURI URI for the chapter metadata
     */
    function submitProposal(
        uint256 storyId,
        string memory contentHash,
        uint256 chapterNumber,
        string memory metadataURI
    ) external payable nonReentrant {
        require(msg.value >= minimumStake, "PlotVoting: Insufficient stake amount");
        require(bytes(contentHash).length > 0, "PlotVoting: Content hash cannot be empty");
        require(chapterNumber > 0, "PlotVoting: Chapter number must be positive");
        
        uint256 proposalId = _proposalIds.current();
        _proposalIds.increment();
        
        Proposal storage proposal = proposals[proposalId];
        proposal.storyId = storyId;
        proposal.author = msg.sender;
        proposal.contentHash = contentHash;
        proposal.chapterNumber = chapterNumber;
        proposal.voteCount = 0;
        proposal.stakeAmount = msg.value;
        proposal.deadline = block.timestamp + votingDuration;
        proposal.executed = false;
        proposal.rejected = false;
        proposal.totalVoters = 0;
        
        // Add to story's proposal list
        storyProposals[storyId].push(proposalId);
        
        emit ProposalSubmitted(proposalId, msg.sender, storyId, contentHash, msg.value, proposal.deadline);
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param voteAmount Amount of tokens to vote with
     */
    function vote(uint256 proposalId, uint256 voteAmount) external proposalExists(proposalId) proposalActive(proposalId) nonReentrant {
        require(voteAmount > 0, "PlotVoting: Vote amount must be positive");
        require(!proposals[proposalId].hasVoted[msg.sender], "PlotVoting: Already voted");
        
        Proposal storage proposal = proposals[proposalId];
        
        // Record the vote
        proposal.votes[msg.sender] = voteAmount;
        proposal.hasVoted[msg.sender] = true;
        proposal.voteCount += voteAmount;
        proposal.totalVoters++;
        
        emit VoteCast(proposalId, msg.sender, voteAmount, proposal.voteCount);
    }
    
    /**
     * @dev Execute the winning proposal and mint the NFT
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external proposalExists(proposalId) votingEnded(proposalId) nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "PlotVoting: Proposal already executed");
        require(!proposal.rejected, "PlotVoting: Proposal already rejected");
        require(proposal.voteCount >= minimumVotesToExecute, "PlotVoting: Insufficient votes to execute");
        
        // Mark as executed
        proposal.executed = true;
        
        // Mint the NFT
        uint256 tokenId = storyNFT.mintChapter(
            proposal.storyId,
            proposal.contentHash,
            proposal.chapterNumber,
            "" // metadataURI will be set by the author later
        );
        
        // Update vote count in StoryNFT
        storyNFT.updateVoteCount(tokenId, proposal.voteCount);
        
        // Distribute stake to voters
        _distributeStakeToVoters(proposalId);
        
        emit ProposalExecuted(proposalId, proposal.storyId, proposal.author, tokenId);
    }
    
    /**
     * @dev Reject a proposal that didn't meet requirements
     * @param proposalId ID of the proposal to reject
     */
    function rejectProposal(uint256 proposalId) external onlyOwner proposalExists(proposalId) votingEnded(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "PlotVoting: Proposal already executed");
        require(!proposal.rejected, "PlotVoting: Proposal already rejected");
        require(proposal.voteCount < minimumVotesToExecute, "PlotVoting: Proposal has sufficient votes");
        
        proposal.rejected = true;
        
        // Return stake to author
        payable(proposal.author).transfer(proposal.stakeAmount);
        
        emit ProposalRejected(proposalId, proposal.storyId, proposal.author);
    }
    
    /**
     * @dev Get proposal information
     * @param proposalId ID of the proposal
     * @return storyId, author, contentHash, chapterNumber, voteCount, stakeAmount, deadline, executed, rejected, totalVoters
     */
    function getProposal(uint256 proposalId) external view proposalExists(proposalId) returns (
        uint256 storyId,
        address author,
        string memory contentHash,
        uint256 chapterNumber,
        uint256 voteCount,
        uint256 stakeAmount,
        uint256 deadline,
        bool executed,
        bool rejected,
        uint256 totalVoters
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.storyId,
            proposal.author,
            proposal.contentHash,
            proposal.chapterNumber,
            proposal.voteCount,
            proposal.stakeAmount,
            proposal.deadline,
            proposal.executed,
            proposal.rejected,
            proposal.totalVoters
        );
    }
    
    /**
     * @dev Get all proposals for a story
     * @param storyId ID of the story
     * @return Array of proposal IDs
     */
    function getStoryProposals(uint256 storyId) external view returns (uint256[] memory) {
        return storyProposals[storyId];
    }
    
    /**
     * @dev Get total number of proposals
     * @return Total proposal count
     */
    function getTotalProposals() external view returns (uint256) {
        return _proposalIds.current() - 1;
    }
    
    /**
     * @dev Check if a user has voted on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Whether the user has voted
     */
    function hasVoted(uint256 proposalId, address voter) external view proposalExists(proposalId) returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get a user's vote amount for a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Vote amount
     */
    function getVoteAmount(uint256 proposalId, address voter) external view proposalExists(proposalId) returns (uint256) {
        return proposals[proposalId].votes[voter];
    }
    
    /**
     * @dev Update voting parameters (owner only)
     * @param _votingDuration New voting duration in seconds
     * @param _minimumStake New minimum stake amount
     * @param _minimumVotesToExecute New minimum votes required to execute
     */
    function updateVotingParameters(
        uint256 _votingDuration,
        uint256 _minimumStake,
        uint256 _minimumVotesToExecute
    ) external onlyOwner {
        require(_votingDuration > 0, "PlotVoting: Voting duration must be positive");
        require(_minimumVotesToExecute > 0, "PlotVoting: Minimum votes must be positive");
        
        votingDuration = _votingDuration;
        minimumStake = _minimumStake;
        minimumVotesToExecute = _minimumVotesToExecute;
    }
    
    /**
     * @dev Distribute stake to voters based on their vote weight
     * @param proposalId ID of the proposal
     */
    function _distributeStakeToVoters(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalStake = proposal.stakeAmount;
        uint256 totalVotes = proposal.voteCount;
        
        if (totalVotes == 0) {
            // If no votes, return stake to author
            payable(proposal.author).transfer(totalStake);
            return;
        }
        
        // Calculate author's share (20% of stake)
        uint256 authorShare = (totalStake * 20) / 100;
        payable(proposal.author).transfer(authorShare);
        
        // Distribute remaining stake to voters proportionally
        uint256 remainingStake = totalStake - authorShare;
        
        for (uint256 i = 0; i < storyProposals[proposal.storyId].length; i++) {
            uint256 currentProposalId = storyProposals[proposal.storyId][i];
            Proposal storage currentProposal = proposals[currentProposalId];
            
            if (currentProposal.hasVoted[msg.sender]) {
                uint256 voterShare = (remainingStake * currentProposal.votes[msg.sender]) / totalVotes;
                payable(msg.sender).transfer(voterShare);
            }
        }
    }
    
    /**
     * @dev Emergency function to withdraw stuck funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
