import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS, CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3';
import { parseEther } from 'viem';
import { useEffect, useMemo, useState, useCallback } from 'react';

export interface Chapter {
  id: bigint;
  author: string;
  content: string;
  votes: bigint;
  timestamp: bigint;
}

export function usePlotVoting() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Record<number, Chapter[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      // reset after success so user can run another action
      const t = setTimeout(() => reset(), 500)
      return () => clearTimeout(t)
    }
  }, [isConfirmed, reset])

  // Get the number of chapters for a story
  const getChaptersCount = useCallback(async (storyId: bigint): Promise<number> => {
    try {
      const count = await readContract({
        address: CONTRACT_ADDRESSES.plotVoting as `0x${string}`,
        abi: CONTRACT_ABIS.plotVoting,
        functionName: 'getChaptersCount',
        args: [storyId],
      });
      return Number(count) || 0;
    } catch (err) {
      console.error(`Error getting chapters count for story ${storyId}:`, err);
      return 0;
    }
  }, []);

  // Get a specific chapter
  const getChapter = useCallback(async (storyId: bigint, chapterId: bigint): Promise<Chapter | null> => {
    try {
      const result = await readContract({
        address: CONTRACT_ADDRESSES.plotVoting as `0x${string}`,
        abi: CONTRACT_ABIS.plotVoting,
        functionName: 'getChapter',
        args: [storyId, chapterId],
      });
      
      if (!result) return null;
      
      return {
        id: chapterId,
        author: result[0],
        content: result[1],
        votes: result[2],
        timestamp: result[3],
      };
    } catch (err) {
      console.error(`Error fetching chapter ${chapterId} for story ${storyId}:`, err);
      return null;
    }
  }, []);

  // Fetch all chapters for a story
  const fetchChapters = useCallback(async (storyId: bigint) => {
    setLoading(true);
    setError(null);
    
    try {
      const count = await getChaptersCount(storyId);
      const chapterPromises = [];
      
      for (let i = 0; i < count; i++) {
        chapterPromises.push(getChapter(storyId, BigInt(i)));
      }
      
      const chapters = (await Promise.all(chapterPromises)).filter(Boolean) as Chapter[];
      setChapters(prev => ({
        ...prev,
        [Number(storyId)]: chapters,
      }));
    } catch (err) {
      console.error(`Error fetching chapters for story ${storyId}:`, err);
      setError('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  }, [getChaptersCount, getChapter]);

  // Submit a new chapter for a story
  const submitChapter = useCallback(async (storyId: bigint, content: string) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return false;
    }
    
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.plotVoting as `0x${string}`,
        abi: CONTRACT_ABIS.plotVoting,
        functionName: 'submitChapter',
        args: [storyId, content],
      });
      
      setLastAction('submitChapter');
      return hash;
    } catch (err) {
      console.error('Error submitting chapter:', err);
      setError('Failed to submit chapter');
      return null;
    }
  }, [isConnected, address, writeContractAsync]);

  // Vote for a chapter
  const voteForChapter = useCallback(async (storyId: bigint, chapterId: bigint) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return false;
    }
    
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.plotVoting as `0x${string}`,
        abi: CONTRACT_ABIS.plotVoting,
        functionName: 'voteForChapter',
        args: [storyId, chapterId],
      });
      
      setLastAction('voteForChapter');
      return hash;
    } catch (err) {
      console.error('Error voting for chapter:', err);
      setError('Failed to vote for chapter');
      return null;
    }
  }, [isConnected, address, writeContractAsync]);

  // Get the winning chapter for a story
  const getWinningChapter = useCallback(async (storyId: bigint): Promise<bigint | null> => {
    try {
      const chapterId = await readContract({
        address: CONTRACT_ADDRESSES.plotVoting as `0x${string}`,
        abi: CONTRACT_ABIS.plotVoting,
        functionName: 'getWinningChapter',
        args: [storyId],
      });
      
      return chapterId as bigint;
    } catch (err) {
      console.error(`Error getting winning chapter for story ${storyId}:`, err);
      return null;
    }
  }, []);

  const actions = useMemo(() => ({
    vote: async (proposalId: bigint, voteAmount: bigint) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'vote',
        args: [proposalId, voteAmount],
      }).then((h) => { setLastAction('vote'); return h });
    },
    submitChapter,
    voteForChapter,
    getChaptersCount,
    getChapter,
    fetchChapters,
    getWinningChapter,
    rejectProposal: async (proposalId: bigint) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'rejectProposal',
        args: [proposalId],
      }).then((h) => { setLastAction('reject'); return h });
    },
    enableConfidentialVoting: async (proposalId: bigint, commitDurationSec: bigint, revealDurationSec: bigint) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'enableConfidentialVoting',
        args: [proposalId, commitDurationSec, revealDurationSec],
      }).then((h) => { setLastAction('enableConfidential'); return h })
    },
    commitVote: async (proposalId: bigint, commitment: `0x${string}`) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'commitVote',
        args: [proposalId, commitment],
      }).then((h) => { setLastAction('commit'); return h })
    },
    revealVote: async (proposalId: bigint, voteAmount: bigint, saltHex32: `0x${string}`) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'revealVote',
        args: [proposalId, voteAmount, saltHex32],
      }).then((h) => { setLastAction('reveal'); return h })
    },
