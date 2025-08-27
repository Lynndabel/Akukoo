import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '@/lib/web3'
import { parseEther, keccak256, encodePacked } from 'viem'
import { useEffect, useMemo, useState } from 'react'

export function usePlotVoting() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync, data: hash, isPending, error: writeError, reset } = useWriteContract()
  const [lastAction, setLastAction] = useState<string | null>(null)

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      // reset after success so user can run another action
      const t = setTimeout(() => reset(), 500)
      return () => clearTimeout(t)
    }
  }, [isConfirmed, reset])

  const actions = useMemo(() => ({
    vote: async (proposalId: bigint, voteAmount: bigint) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'vote',
        args: [proposalId, voteAmount],
      }).then((h) => { setLastAction('vote'); return h })
    },
    stakeForProposal: async (proposalId: bigint, stakeEth: string) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'stakeForProposal',
        args: [proposalId],
        value: parseEther(stakeEth || '0'),
      }).then((h) => { setLastAction('stake'); return h })
    },
    executeProposal: async (proposalId: bigint) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'executeProposal',
        args: [proposalId],
      }).then((h) => { setLastAction('execute'); return h })
    },
    rejectProposal: async (proposalId: bigint) => {
      return writeContractAsync({
        address: CONTRACTS.plotVoting.address,
        abi: CONTRACTS.plotVoting.abi,
        functionName: 'rejectProposal',
        args: [proposalId],
      }).then((h) => { setLastAction('reject'); return h })
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
  }), [writeContractAsync])

  return {
    isConnected,
    address,
    tx: {
      hash,
      isPending,
      isConfirming,
      isConfirmed,
      writeError,
      confirmError,
      lastAction,
    },
    ...actions,
    computeCommitment: (voteAmount: bigint, saltHex32: `0x${string}`, voter: `0x${string}`) =>
      keccak256(encodePacked(['uint256','bytes32','address'], [voteAmount, saltHex32, voter])) as `0x${string}`,
  }
}
