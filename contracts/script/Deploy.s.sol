// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/StoryNFT.sol";
import "../src/PlotVoting.sol";
import "../src/StoryTreasury.sol";
import "../src/ReputationStaking.sol";

/**
 * @title Deploy
 * @dev Deployment script for the On-Chain Story Game contracts
 * @notice This script deploys all contracts and sets up initial configuration
 */
contract Deploy is Script {
    // Contract instances
    StoryNFT public storyNFT;
    PlotVoting public plotVoting;
    StoryTreasury public storyTreasury;
    ReputationStaking public reputationStaking;
    
    // Deployment addresses
    address public deployer;
    
    function run() external {
        // Get deployer address
        deployer = msg.sender;
        
        // Start broadcasting transactions
        vm.startBroadcast();
        
        console.log("Starting deployment of On-Chain Story Game contracts...");
        console.log("Deployer address:", deployer);
        
        // Deploy StoryNFT first (base contract)
        console.log("\nDeploying StoryNFT...");
        storyNFT = new StoryNFT();
        console.log("StoryNFT deployed at:", address(storyNFT));
        
        // Deploy PlotVoting with StoryNFT reference
        console.log("\nDeploying PlotVoting...");
        plotVoting = new PlotVoting(address(storyNFT));
        console.log("PlotVoting deployed at:", address(plotVoting));
        
        // Deploy StoryTreasury with StoryNFT reference
        console.log("\nDeploying StoryTreasury...");
        storyTreasury = new StoryTreasury(address(storyNFT));
        console.log("StoryTreasury deployed at:", address(storyTreasury));
        
        // Deploy ReputationStaking
        console.log("\nDeploying ReputationStaking...");
        reputationStaking = new ReputationStaking();
        console.log("ReputationStaking deployed at:", address(reputationStaking));
        
        // Configure contracts
        console.log("\nConfiguring contracts...");
        
        // Set PlotVoting as authorized minter for StoryNFT
        storyNFT.setAuthorizedMinter(address(plotVoting), true);
        console.log("PlotVoting authorized as minter for StoryNFT");
        
        // Set deployer as authorized minter for testing
        storyNFT.setAuthorizedMinter(deployer, true);
        console.log("Deployer authorized as minter for StoryNFT");
        
        // Transfer ownership of contracts to deployer
        storyNFT.transferOwnership(deployer);
        plotVoting.transferOwnership(deployer);
        storyTreasury.transferOwnership(deployer);
        reputationStaking.transferOwnership(deployer);
        console.log("Contract ownership transferred to deployer");
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Deployment summary
        console.log("\nDeployment completed successfully!");
        console.log("==========================================");
        console.log("Contract Addresses:");
        console.log("StoryNFT:", address(storyNFT));
        console.log("PlotVoting:", address(plotVoting));
        console.log("StoryTreasury:", address(storyTreasury));
        console.log("ReputationStaking:", address(reputationStaking));
        console.log("==========================================");
        console.log("\nNext steps:");
        console.log("1. Verify contracts on Etherscan");
        console.log("2. Run tests: forge test");
        console.log("3. Deploy to testnet for testing");
        console.log("4. Update frontend with contract addresses");
    }
    
    /**
     * @dev Get deployment summary for verification
     */
    function getDeploymentSummary() external view returns (
        address storyNFTAddress,
        address plotVotingAddress,
        address storyTreasuryAddress,
        address reputationStakingAddress
    ) {
        return (
            address(storyNFT),
            address(plotVoting),
            address(storyTreasury),
            address(reputationStaking)
        );
    }
}
