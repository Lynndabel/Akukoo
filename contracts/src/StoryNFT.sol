// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StoryNFT
 * @dev ERC721 implementation for story chapters with metadata management
 * @notice This contract handles the minting and management of story chapter NFTs
 */
contract StoryNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Events
    event ChapterMinted(
        uint256 indexed tokenId,
        uint256 indexed storyId,
        address indexed author,
        uint256 chapterNumber,
        string contentHash,
        uint256 timestamp
    );
    
    event StoryCreated(
        uint256 indexed storyId,
        address indexed creator,
        string title,
        string description,
        uint256 timestamp
    );
    
    // Structs
    struct Chapter {
        uint256 storyId;
        uint256 chapterNumber;
        address author;
        string contentHash; // IPFS hash
        uint256 voteCount;
        uint256 timestamp;
        bool exists;
    }
    
    struct Story {
        address creator;
        string title;
        string description;
        uint256 totalChapters;
        uint256 createdAt;
        bool exists;
    }
    
    // State variables
    Counters.Counter private _tokenIds;
    Counters.Counter private _storyIds;
    
    mapping(uint256 => Chapter) public chapters;
    mapping(uint256 => Story) public stories;
    mapping(uint256 => uint256[]) public storyChapters; // storyId => array of tokenIds
    
    // Access control
    mapping(address => bool) public authorizedMinters;
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "StoryNFT: Not authorized to mint");
        _;
    }
    
    modifier storyExists(uint256 storyId) {
        require(stories[storyId].exists, "StoryNFT: Story does not exist");
        _;
    }
    
    modifier chapterExists(uint256 tokenId) {
        require(chapters[tokenId].exists, "StoryNFT: Chapter does not exist");
        _;
    }
    
    // Constructor
    constructor() ERC721("Story Chapters", "STORY") {
        _tokenIds.increment(); // Start from 1
        _storyIds.increment(); // Start from 1
    }
    
    /**
     * @dev Create a new story
     * @param title Story title
     * @param description Story description
     * @return storyId The ID of the created story
     */
    function createStory(
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(bytes(title).length > 0, "StoryNFT: Title cannot be empty");
        require(bytes(description).length > 0, "StoryNFT: Description cannot be empty");
        
        uint256 storyId = _storyIds.current();
        _storyIds.increment();
        
        stories[storyId] = Story({
            creator: msg.sender,
            title: title,
            description: description,
            totalChapters: 0,
            createdAt: block.timestamp,
            exists: true
        });
        
        emit StoryCreated(storyId, msg.sender, title, description, block.timestamp);
        
        return storyId;
    }
    
    /**
     * @dev Mint a new chapter NFT
     * @param storyId ID of the story
     * @param contentHash IPFS hash of the chapter content
     * @param chapterNumber Chapter number in the story
     * @param metadataURI URI for the chapter metadata
     * @return tokenId The ID of the minted NFT
     */
    function mintChapter(
        uint256 storyId,
        string memory contentHash,
        uint256 chapterNumber,
        string memory metadataURI
    ) external onlyAuthorizedMinter storyExists(storyId) nonReentrant returns (uint256) {
        require(bytes(contentHash).length > 0, "StoryNFT: Content hash cannot be empty");
        require(chapterNumber > 0, "StoryNFT: Chapter number must be positive");
        
        // Check if chapter number already exists for this story
        uint256[] storage existingChapters = storyChapters[storyId];
        for (uint256 i = 0; i < existingChapters.length; i++) {
            if (chapters[existingChapters[i]].chapterNumber == chapterNumber) {
                revert("StoryNFT: Chapter number already exists");
            }
        }
        
        uint256 tokenId = _tokenIds.current();
        _tokenIds.increment();
        
        chapters[tokenId] = Chapter({
            storyId: storyId,
            chapterNumber: chapterNumber,
            author: msg.sender,
            contentHash: contentHash,
            voteCount: 0,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Add to story's chapter list
        storyChapters[storyId].push(tokenId);
        stories[storyId].totalChapters++;
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit ChapterMinted(tokenId, storyId, msg.sender, chapterNumber, contentHash, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @dev Update chapter vote count (called by voting contract)
     * @param tokenId ID of the chapter NFT
     * @param voteCount New vote count
     */
    function updateVoteCount(uint256 tokenId, uint256 voteCount) external onlyAuthorizedMinter {
        require(chapters[tokenId].exists, "StoryNFT: Chapter does not exist");
        chapters[tokenId].voteCount = voteCount;
    }
    
    /**
     * @dev Get chapter information
     * @param tokenId ID of the chapter NFT
     * @return Chapter struct with all chapter data
     */
    function getChapter(uint256 tokenId) external view chapterExists(tokenId) returns (Chapter memory) {
        return chapters[tokenId];
    }
    
    /**
     * @dev Get story information
     * @param storyId ID of the story
     * @return Story struct with all story data
     */
    function getStory(uint256 storyId) external view storyExists(storyId) returns (Story memory) {
        return stories[storyId];
    }
    
    /**
     * @dev Get all chapters for a story
     * @param storyId ID of the story
     * @return Array of chapter token IDs
     */
    function getStoryChapters(uint256 storyId) external view storyExists(storyId) returns (uint256[] memory) {
        return storyChapters[storyId];
    }
    
    /**
     * @dev Get total number of stories
     * @return Total story count
     */
    function getTotalStories() external view returns (uint256) {
        return _storyIds.current() - 1;
    }
    
    /**
     * @dev Get total number of chapters
     * @return Total chapter count
     */
    function getTotalChapters() external view returns (uint256) {
        return _tokenIds.current() - 1;
    }
    
    /**
     * @dev Authorize an address to mint chapters
     * @param minter Address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
