// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StoryNFT.sol";

/**
 * @title PlotVoting
 * @dev Manages chapter proposals and voting for story chapters
 * @notice This contract handles the democratic process of choosing story directionss
 */
contract PlotVoting is Ownable, ReentrancyGuard {
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
    
    // Confidential voting events
    event VoteCommitted(uint256 indexed proposalId, address indexed voter);
    event VoteRevealed(uint256 indexed proposalId, address indexed voter, uint256 amount, uint256 totalVotes);
    // Eligibility / DAO mode events
    event ElectionModeUpdated(uint256 indexed proposalId, bool enabled);
    event EligibilityUpdated(uint256 indexed proposalId, address indexed voter, bool allowed);
    
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
        mapping(address => uint256) voterStakes; // voter => optional stake amount
        address[] voterList; // list of voters to enable iteration for rewards/refunds
        uint256 totalVoterStake; // aggregate optional stake from voters
        // Confidential voting fields
        bool confidential; // if true, use commit-reveal
        uint256 commitDeadline; // end of commit phase
        uint256 revealDeadline; // end of reveal phase
        mapping(address => bytes32) voteCommitments; // voter => commitment
        mapping(address => bool) hasRevealed; // voter => has revealed
        // DAO Election mode + eligibility
        bool electionMode; // if true, apply eligibility checks and (optionally) stricter rules
        bool eligibilityEnabled; // if true, only addresses explicitly allowed can participate
        mapping(address => bool) eligibleVoters; // voter => is eligible
    }
    
    struct VoteInfo {
        uint256 amount;
        uint256 timestamp;
    }
    
    // State variables
    uint256 private _nextProposalId = 1;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public storyProposals; // storyId => array of proposalIds
    
    // Voting parameters
    uint256 public votingDuration = 7 days;
    uint256 public minimumStake = 0.01 ether;
    uint256 public minimumVotesToExecute = 10;
    uint256 public minimumVoterStake = 0.001 ether; // Deprecated: voting is free; kept for backwards-compatibility
    
    // Contract references
    StoryNFT public storyNFT;
    
    // Modifiers
    modifier proposalExists(uint256 proposalId) {
        require(_nextProposalId > proposalId && proposalId > 0, "PlotVoting: Proposal does not exist");
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
    constructor(address _storyNFT) Ownable(msg.sender) {
        storyNFT = StoryNFT(_storyNFT);
        // Proposal IDs start from 1
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
        
        // Check if user already submitted for this chapter
        require(!_hasUserSubmittedForChapter(storyId, chapterNumber, msg.sender), "PlotVoting: User already submitted for this chapter");
        
        uint256 proposalId = _nextProposalId++;
        
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
        proposal.confidential = false;
        proposal.commitDeadline = 0;
        proposal.revealDeadline = 0;
        proposal.electionMode = false;
        proposal.eligibilityEnabled = false;
        
        // Add to story's proposal list
        storyProposals[storyId].push(proposalId);
        
        emit ProposalSubmitted(proposalId, msg.sender, storyId, contentHash, msg.value, proposal.deadline);
    }

    /**
     * @dev Enable confidential voting (commit-reveal) for an existing proposal. Owner can call before current deadline.
     * @param proposalId ID of the proposal
     * @param commitDuration Duration of commit phase in seconds
     * @param revealDuration Duration of reveal phase in seconds
     */
    function enableConfidentialVoting(uint256 proposalId, uint256 commitDuration, uint256 revealDuration)
        external
        onlyOwner
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed && !proposal.rejected, "PlotVoting: Invalid state");
        require(block.timestamp < proposal.deadline, "PlotVoting: Too late to enable");
        require(!proposal.confidential, "PlotVoting: Already confidential");
        require(commitDuration > 0 && revealDuration > 0, "PlotVoting: Durations must be > 0");

        proposal.confidential = true;
        proposal.commitDeadline = block.timestamp + commitDuration;
        proposal.revealDeadline = proposal.commitDeadline + revealDuration;
        proposal.deadline = proposal.revealDeadline; // extend overall deadline to reveal end
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param voteAmount Amount of tokens to vote with
     */
    function vote(uint256 proposalId, uint256 voteAmount) external payable proposalExists(proposalId) proposalActive(proposalId) nonReentrant {
        require(voteAmount > 0, "PlotVoting: Vote amount must be positive");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.confidential, "PlotVoting: Confidential voting enabled - use commit/reveal");
        require(_isEligible(proposalId, msg.sender), "PlotVoting: Not eligible to vote");
        require(!proposal.hasVoted[msg.sender], "PlotVoting: Already voted");
        
        // Record the vote with stake
        proposal.votes[msg.sender] = voteAmount;
        proposal.hasVoted[msg.sender] = true;
        proposal.voterList.push(msg.sender);
        proposal.voteCount += voteAmount;
        proposal.totalVoters++;

        // Optional ETH stake sent with vote
        if (msg.value > 0) {
            proposal.voterStakes[msg.sender] += msg.value;
            proposal.totalVoterStake += msg.value;
        }
        
        emit VoteCast(proposalId, msg.sender, voteAmount, proposal.voteCount);
    }

    /**
     * @dev Commit a vote hash for confidential proposals during commit phase.
     * Commitment should be keccak256(abi.encodePacked(voteAmount, salt, voter)).
     */
    function commitVote(uint256 proposalId, bytes32 commitment)
        external
        proposalExists(proposalId)
        proposalActive(proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.confidential, "PlotVoting: Not confidential");
        require(block.timestamp < proposal.commitDeadline, "PlotVoting: Commit phase ended");
        require(_isEligible(proposalId, msg.sender), "PlotVoting: Not eligible to vote");
        require(proposal.voteCommitments[msg.sender] == bytes32(0), "PlotVoting: Already committed");

        proposal.voteCommitments[msg.sender] = commitment;
        // Mark as participant for accounting and potential refunds/rewards
        if (!proposal.hasVoted[msg.sender]) {
            proposal.hasVoted[msg.sender] = true;
            proposal.voterList.push(msg.sender);
            proposal.totalVoters++;
        }
        emit VoteCommitted(proposalId, msg.sender);
    }

    /**
     * @dev Reveal a committed vote during reveal phase.
     */
    function revealVote(uint256 proposalId, uint256 voteAmount, bytes32 salt)
        external
        proposalExists(proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.confidential, "PlotVoting: Not confidential");
        require(block.timestamp >= proposal.commitDeadline, "PlotVoting: Reveal not started");
        require(block.timestamp < proposal.revealDeadline, "PlotVoting: Reveal phase ended");
        require(_isEligible(proposalId, msg.sender), "PlotVoting: Not eligible to vote");
        require(!proposal.hasRevealed[msg.sender], "PlotVoting: Already revealed");
        require(proposal.voteCommitments[msg.sender] != bytes32(0), "PlotVoting: No commitment");
        require(voteAmount > 0, "PlotVoting: Invalid voteAmount");

        bytes32 expected = keccak256(abi.encodePacked(voteAmount, salt, msg.sender));
        require(expected == proposal.voteCommitments[msg.sender], "PlotVoting: Commitment mismatch");

        proposal.votes[msg.sender] = voteAmount;
        proposal.voteCount += voteAmount;
        proposal.hasRevealed[msg.sender] = true;
        emit VoteRevealed(proposalId, msg.sender, voteAmount, proposal.voteCount);
    }

    /**
     * @dev Optionally stake ETH towards a proposal to be eligible for voter rewards if it wins
     * @param proposalId ID of the proposal to stake on
     */
    function stakeForProposal(uint256 proposalId) external payable proposalExists(proposalId) proposalActive(proposalId) nonReentrant {
        require(msg.value > 0, "PlotVoting: Stake amount must be positive");
        Proposal storage proposal = proposals[proposalId];

        // If this is the user's first interaction (no prior vote), register them as a voter for accounting
        if (!proposal.hasVoted[msg.sender]) {
            proposal.hasVoted[msg.sender] = true;
            proposal.voterList.push(msg.sender);
            proposal.totalVoters++;
            // No change to voteCount since they didn't cast votes here
        }

        proposal.voterStakes[msg.sender] += msg.value;
        proposal.totalVoterStake += msg.value;
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
            "", // metadataURI will be set by the author later
            proposal.author
        );
        
        // Update vote count in StoryNFT
        storyNFT.updateVoteCount(tokenId, proposal.voteCount);
        
        // Distribute stake to author and stakers for this winning proposal
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
        
        // Refund all voter optional stakes
        if (proposal.totalVoterStake > 0) {
            for (uint256 i = 0; i < proposal.voterList.length; i++) {
                address voter = proposal.voterList[i];
                uint256 stakeAmt = proposal.voterStakes[voter];
                if (stakeAmt > 0) {
                    proposal.voterStakes[voter] = 0;
                    payable(voter).transfer(stakeAmt);
                }
            }
            proposal.totalVoterStake = 0;
        }
        
        emit ProposalRejected(proposalId, proposal.storyId, proposal.author);
    }

    /**
     * @dev Returns privacy metadata for a proposal.
     */
    function getProposalPrivacy(uint256 proposalId) external view proposalExists(proposalId) returns (
        bool confidential,
        uint256 commitDeadline,
        uint256 revealDeadline
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.confidential, p.commitDeadline, p.revealDeadline);
    }

    /**
     * @dev Returns election/eligibility metadata for a proposal.
     */
    function getProposalEligibility(uint256 proposalId) external view proposalExists(proposalId) returns (
        bool electionMode,
        bool eligibilityEnabled
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.electionMode, p.eligibilityEnabled);
    }

    function hasCommitted(uint256 proposalId, address voter) external view proposalExists(proposalId) returns (bool) {
        return proposals[proposalId].voteCommitments[voter] != bytes32(0);
    }

    function hasRevealed(uint256 proposalId, address voter) external view proposalExists(proposalId) returns (bool) {
        return proposals[proposalId].hasRevealed[voter];
    }
    
    /**
     * @dev Get proposal information
     * @param proposalId ID of the proposal
     * @return storyId Story ID
     * @return author Author address
     * @return contentHash Content hash
     * @return chapterNumber Chapter number
     * @return voteCount Vote count
     * @return stakeAmount Stake amount
     * @return deadline Deadline timestamp
     * @return executed Whether executed
     * @return rejected Whether rejected
     * @return totalVoters Total voters count
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
    function getTotalProposals() public view returns (uint256) {
        return _nextProposalId - 1;
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
     * @dev Check if user has submitted for a specific chapter
     * @param storyId ID of the story
     * @param chapterNumber Chapter number
     * @param user Address of the user
     * @return Whether user has submitted
     */
    function hasUserSubmittedForChapter(uint256 storyId, uint256 chapterNumber, address user) external view returns (bool) {
        return _hasUserSubmittedForChapter(storyId, chapterNumber, user);
    }
    
    /**
     * @dev Get user's active submissions
     * @param user Address of the user
     * @return Array of proposal IDs where user is author
     */
    function getUserSubmissions(address user) external view returns (uint256[] memory) {
        uint256[] memory userProposals = new uint256[](getTotalProposals());
        uint256 count = 0;
        
        for (uint256 i = 1; i <= getTotalProposals(); i++) {
            if (proposals[i].author == user) {
                userProposals[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userProposals[i];
        }
        
        return result;
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
     * @dev Enable or disable election mode for a proposal (owner only).
     * When enabled, eligibility rules are enforced for participation.
     */
    function setElectionMode(uint256 proposalId, bool enabled)
        external
        onlyOwner
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed && !proposal.rejected, "PlotVoting: Invalid state");
        proposal.electionMode = enabled;
        emit ElectionModeUpdated(proposalId, enabled);
    }

    /**
     * @dev Batch set eligibility for voters on a proposal (owner only).
     * Setting any voter toggles eligibilityEnabled=true.
     */
    function setEligibleVoters(uint256 proposalId, address[] calldata voters, bool allowed)
        external
        onlyOwner
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed && !proposal.rejected, "PlotVoting: Invalid state");
        proposal.eligibilityEnabled = true;
        for (uint256 i = 0; i < voters.length; i++) {
            address v = voters[i];
            proposal.eligibleVoters[v] = allowed;
            emit EligibilityUpdated(proposalId, v, allowed);
        }
    }

    /**
     * @dev Check if an address is eligible to participate in a proposal.
     */
    function isEligible(uint256 proposalId, address voter) external view proposalExists(proposalId) returns (bool) {
        return _isEligible(proposalId, voter);
    }

    function _isEligible(uint256 proposalId, address voter) internal view returns (bool) {
        Proposal storage p = proposals[proposalId];
        if (!(p.electionMode || p.eligibilityEnabled)) {
            // If neither election mode nor eligibility is enabled, allow open voting
            return true;
        }
        if (!p.eligibilityEnabled) {
            // Election mode without explicit list means open eligibility
            return true;
        }
        return p.eligibleVoters[voter];
    }
    
    /**
     * @dev Distribute stakes to voters and author based on voting results
     * @param proposalId ID of the proposal
     */
    function _distributeStakeToVoters(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalAuthorStake = proposal.stakeAmount;
        uint256 totalVoterStakes = _calculateTotalVoterStakes(proposalId);
        uint256 totalStakes = totalAuthorStake + totalVoterStakes;
        
        if (totalVoterStakes == 0) {
            // If no votes, return all stakes to original owners
            payable(proposal.author).transfer(totalAuthorStake);
            return;
        }
        
        // Calculate distribution percentages
        uint256 authorShare = (totalStakes * 60) / 100; // 60% to author
        uint256 voterShare = (totalStakes * 30) / 100;  // 30% to voters
        uint256 platformShare = totalStakes - authorShare - voterShare; // 10% to platform
        
        // Pay author their share
        payable(proposal.author).transfer(authorShare);
        
        // Distribute voter share proportionally based on their stake contribution
        _distributeVoterRewards(proposalId, voterShare);
        
        // Platform share remains in contract
    }
    
    /**
     * @dev Calculate total stakes from all voters for a proposal
     * @param proposalId ID of the proposal
     * @return Total voter stakes
     */
    function _calculateTotalVoterStakes(uint256 proposalId) internal view returns (uint256) {
        Proposal storage proposal = proposals[proposalId];
        return proposal.totalVoterStake;
    }
    
    /**
     * @dev Distribute voter rewards proportionally
     * @param proposalId ID of the proposal
     * @param totalReward Total reward amount to distribute
     */
    function _distributeVoterRewards(uint256 proposalId, uint256 totalReward) internal {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalStakes = proposal.totalVoterStake;
        if (totalStakes == 0 || totalReward == 0) return;

        // Iterate over voter list and distribute proportionally to stake
        for (uint256 i = 0; i < proposal.voterList.length; i++) {
            address voter = proposal.voterList[i];
            uint256 stakeAmt = proposal.voterStakes[voter];
            if (stakeAmt == 0) continue; // only stakers share rewards
            uint256 reward = (totalReward * stakeAmt) / totalStakes;
            if (reward > 0) {
                payable(voter).transfer(reward);
            }
        }
    }
    
    /**
     * @dev Check if user already submitted for a specific chapter
     * @param storyId ID of the story
     * @param chapterNumber Chapter number
     * @param user Address of the user
     * @return Whether user already submitted
     */
    function _hasUserSubmittedForChapter(uint256 storyId, uint256 chapterNumber, address user) internal view returns (bool) {
        uint256[] storage storyProposalIds = storyProposals[storyId];
        for (uint256 i = 0; i < storyProposalIds.length; i++) {
            if (storyProposalIds[i] > 0) {
                Proposal storage proposal = proposals[storyProposalIds[i]];
                if (proposal.author == user && proposal.chapterNumber == chapterNumber) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * @dev Emergency function to withdraw stuck funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
