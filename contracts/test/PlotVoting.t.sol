// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/StoryNFT.sol";
import "../src/PlotVoting.sol";

contract PlotVotingTest is Test {
    StoryNFT storyNFT;
    PlotVoting voting;

    address author = address(0xA11CE);
    address voter1 = address(0xBEEF1);
    address voter2 = address(0xBEEF2);

    function setUp() public {
        storyNFT = new StoryNFT();
        voting = new PlotVoting(address(storyNFT));

        // authorize voting to mint
        storyNFT.setAuthorizedMinter(address(voting), true);
        // also allow this test to mint stories if needed (creator is any address)

        // give ETH to participants
        vm.deal(author, 100 ether);
        vm.deal(voter1, 100 ether);
        vm.deal(voter2, 100 ether);

        // transfer ownerships to this contract so we can call owner functions if needed
        storyNFT.transferOwnership(address(this));
        voting.transferOwnership(address(this));

        // Create a story
        vm.prank(author);
        uint256 storyId = storyNFT.createStory("Test Story", "A story for tests");
        assertEq(storyId, 1);
    }

    function _submitProposal(uint256 storyId, uint256 chapterNumber, address from, uint256 stake) internal returns (uint256) {
        vm.prank(from);
        voting.submitProposal{value: stake}(storyId, "ipfs://hash", chapterNumber, "");
        // proposal ids start at 1
        return voting.getTotalProposals();
    }

    function test_FreeVoting_NoEthRequired() public {
        uint256 proposalId = _submitProposal(1, 1, author, 1 ether);

        // voter1 votes without sending ETH
        vm.prank(voter1);
        voting.vote(proposalId, 5);

        // voter2 votes without sending ETH
        vm.prank(voter2);
        voting.vote(proposalId, 10);

        // check vote count
        (
            ,
            ,
            ,
            ,
            uint256 voteCount,
            ,
            ,
            ,
            ,
            
        ) = voting.getProposal(proposalId);
        assertEq(voteCount, 15);
    }

    function test_OptionalStaking_DistributionOnExecute() public {
        uint256 authorStart = author.balance;
        uint256 v1Start = voter1.balance;
        uint256 v2Start = voter2.balance;

        uint256 proposalId = _submitProposal(1, 1, author, 2 ether);

        // free votes cast
        vm.prank(voter1);
        voting.vote(proposalId, 5);
        vm.prank(voter2);
        voting.vote(proposalId, 7);

        // optional stakes
        vm.prank(voter1);
        voting.stakeForProposal{value: 1 ether}(proposalId);
        vm.prank(voter2);
        voting.stakeForProposal{value: 3 ether}(proposalId);

        // fast-forward beyond deadline
        // default votingDuration is 7 days
        vm.warp(block.timestamp + 8 days);

        // Ensure minimumVotesToExecute default is 10; current votes 12
        // execute
        voting.executeProposal(proposalId);

        // Distribution from totalStakes = author(2) + voters(4) = 6 ether
        // 60% author = 3.6 ETH, 30% voters = 1.8 ETH, 10% platform kept = 0.6 ETH
        // Voter share split by stake weights: v1:1, v2:3 => total 4
        // v1 gets 1.8 * 1/4 = 0.45 ETH; v2 gets 1.8 * 3/4 = 1.35 ETH

        assertEq(author.balance, authorStart - 2 ether + 3.6 ether, "author payout incorrect");
        assertEq(voter1.balance, v1Start - 1 ether + 0.45 ether, "voter1 payout incorrect");
        assertEq(voter2.balance, v2Start - 3 ether + 1.35 ether, "voter2 payout incorrect");

        // Platform share remains in contract
        assertApproxEqAbs(address(voting).balance, 0.6 ether, 1);
    }

    function test_RefundsOnRejection() public {
        uint256 proposalId = _submitProposal(1, 1, author, 1 ether);

        // cast low votes so it cannot execute (min required 10)
        vm.prank(voter1);
        voting.vote(proposalId, 1);

        // stake some ETH optionally
        vm.prank(voter1);
        voting.stakeForProposal{value: 0.5 ether}(proposalId);

        uint256 authorStart = author.balance;
        uint256 v1Start = voter1.balance;

        // time passes
        vm.warp(block.timestamp + 8 days);

        // reject (owner only)
        voting.rejectProposal(proposalId);

        // author gets back 1 ether; voter gets back 0.5 ether
        // Note: authorStart and v1Start were captured AFTER staking, so final = start + refund
        assertEq(author.balance, authorStart + 1 ether);
        assertEq(voter1.balance, v1Start + 0.5 ether);

        // contract should not hold funds from this round
        assertEq(address(voting).balance, 0);
    }
}
