// Update these addresses with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  storyNFT: "0x...", // Replace with your deployed StoryNFT address
  plotVoting: "0x...", // Replace with your deployed PlotVoting address
  storyTreasury: "0x...", // Replace with your deployed StoryTreasury address
  reputationStaking: "0x...", // Replace with your deployed ReputationStaking address
};

// ABI for StoryNFT
export const STORY_NFT_ABI = [
  "function createStory(string memory _title, string memory _initialContent) external returns (uint256)",
  "function getStory(uint256 _storyId) external view returns (string memory title, string memory content, address author, uint256 timestamp)",
  "function getStoriesCount() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event StoryCreated(uint256 indexed storyId, address indexed author, string title)",
];

// ABI for PlotVoting
export const PLOT_VOTING_ABI = [
  "function submitChapter(uint256 _storyId, string memory _content) external",
  "function voteForChapter(uint256 _storyId, uint256 _chapterId) external",
  "function getChapter(uint256 _storyId, uint256 _chapterId) external view returns (address author, string memory content, uint256 votes, uint256 timestamp)",
  "function getChaptersCount(uint256 _storyId) external view returns (uint256)",
  "function getWinningChapter(uint256 _storyId) external view returns (uint256)",
  "event ChapterSubmitted(uint256 indexed storyId, uint256 indexed chapterId, address author, string content)",
  "event Voted(uint256 indexed storyId, uint256 indexed chapterId, address voter)",
];

// ABI for StoryTreasury
export const STORY_TREASURY_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function getBalance() external view returns (uint256)",
];

// ABI for ReputationStaking
export const REPUTATION_STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function getStake(address user) external view returns (uint256)",
];
