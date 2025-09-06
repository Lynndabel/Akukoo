import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3';
import { useState, useEffect, useCallback } from 'react';

export interface Story {
  id: bigint;
  title: string;
  content: string;
  author: string;
  timestamp: bigint;
}

export function useStoryNFT() {
  const { address, isConnected } = useAccount();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Write contract for creating stories
  const { 
    writeContractAsync: createStoryWrite, 
    data: createStoryHash, 
    isPending: isCreating, 
    error: createError, 
    reset: resetCreate 
  } = useWriteContract();

  // Read stories count
  const { 
    data: storiesCount = BigInt(0),
    refetch: refetchStoriesCount,
    isPending: isCounting
  } = useReadContract({
    address: CONTRACT_ADDRESSES.storyNFT as `0x${string}`,
    abi: CONTRACT_ABIS.storyNFT,
    functionName: 'getStoriesCount',
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: createStoryHash,
  });

  // Get a single story by ID
  const getStory = useCallback(async (id: bigint): Promise<Story | null> => {
    try {
      const result = await readContract({
        address: CONTRACT_ADDRESSES.storyNFT as `0x${string}`,
        abi: CONTRACT_ABIS.storyNFT,
        functionName: 'getStory',
        args: [id],
      });
      
      if (!result) return null;
      
      return {
        id,
        title: result[0],
        content: result[1],
        author: result[2],
        timestamp: result[3],
      };
    } catch (err) {
      console.error(`Error fetching story ${id}:`, err);
      return null;
    }
  }, []);

  // Fetch all stories
  const fetchStories = useCallback(async () => {
    if (!storiesCount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const storyPromises = [];
      const count = Number(storiesCount);
      
      for (let i = 0; i < count; i++) {
        storyPromises.push(getStory(BigInt(i)));
      }
      
      const stories = (await Promise.all(storyPromises)).filter(Boolean) as Story[];
      setStories(stories);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, [storiesCount, getStory]);

  // Refresh stories when count changes or story is created
  useEffect(() => {
    if (storiesCount > 0) {
      fetchStories();
    }
  }, [storiesCount, fetchStories]);

  // Create a new story
  const createStory = async (title: string, content: string) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return false;
    }
    
    try {
      await createStoryWrite({
        address: CONTRACT_ADDRESSES.storyNFT as `0x${string}`,
        abi: CONTRACT_ABIS.storyNFT,
        functionName: 'createStory',
        args: [title, content],
      });
      
      return true;
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Failed to create story');
      return false;
    }
  };

  // Refresh stories when count changes or story is created
  useEffect(() => {
    if (storiesCount > 0) {
      fetchStories();
    }
  }, [storiesCount, fetchStories]);

  // Reset create state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      resetCreate();
      refetchStoriesCount();
    }
  }, [isConfirmed, resetCreate, refetchStoriesCount]);

  return {
    stories,
    createStory,
    getStory,
    loading: loading || isCreating || isConfirming || isCounting,
    error: error || (createError ? createError.message : null),
    isCreating,
    isConfirmed,
  };
}

// Helper function to read contract
async function readContract(options: {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args?: unknown[];
}) {
  try {
    const { readContract } = await import('@wagmi/core');
    const { config } = await import('@/lib/web3');
    
    return await readContract(config, {
      ...options,
      chainId: config.chains[0].id,
    });
  } catch (err) {
    console.error('Error reading contract:', err);
    return null;
  }
}
