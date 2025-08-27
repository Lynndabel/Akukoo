import { useMemo } from 'react'
import { useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { CONTRACTS } from '@/lib/web3'

export type ProposalView = {
  id: bigint
  storyId: bigint
  author: `0x${string}`
  contentHash: string
  chapterNumber: bigint
  voteCount: bigint
  stakeAmount: bigint
  deadline: bigint
  executed: boolean
  rejected: boolean
  totalVoters: bigint
}

export function useProposals(opts?: { pageSize?: number; page?: number; storyId?: bigint }) {
  const pageSize = opts?.pageSize ?? 10
  const page = Math.max(1, opts?.page ?? 1)
  const storyId = opts?.storyId

  const { data: totalRaw, isLoading: loadingTotal, refetch: refetchTotal } = useReadContract({
    abi: CONTRACTS.plotVoting.abi,
    address: CONTRACTS.plotVoting.address,
    functionName: 'getTotalProposals',
  })

  const total = (totalRaw as bigint | undefined) ?? 0n

  // If a storyId is provided, read proposal IDs for that story
  const { data: storyIdsRaw } = useReadContract({
    abi: CONTRACTS.plotVoting.abi,
    address: CONTRACTS.plotVoting.address,
    functionName: 'getStoryProposals',
    args: storyId && storyId > 0n ? [storyId] : undefined,
    query: { enabled: Boolean(storyId && storyId > 0n) },
  })

  const { ids, totalItems, totalPages } = useMemo(() => {
    // Story-specific pagination
    if (storyId && storyId > 0n) {
      const arr = (storyIdsRaw as readonly bigint[] | undefined) ?? []
      const allDesc = [...arr].reverse() // newest first
      const totalItems = allDesc.length
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
      const start = (page - 1) * pageSize
      const paged = allDesc.slice(start, start + pageSize)
      return { ids: paged, totalItems, totalPages }
    }

    // Global pagination by numeric range
    const totalN = Number(total)
    if (!totalN) return { ids: [] as bigint[], totalItems: 0, totalPages: 1 }
    const totalPages = Math.max(1, Math.ceil(totalN / pageSize))
    const offset = (page - 1) * pageSize
    let end = BigInt(totalN - offset) // inclusive, newest id
    let start = end - BigInt(pageSize) + 1n
    if (end < 1n) end = 0n
    if (start < 1n) start = 1n
    const out: bigint[] = []
    for (let id = end; id >= start && id >= 1n; id--) out.push(id)
    return { ids: out, totalItems: totalN, totalPages }
  }, [storyId, storyIdsRaw, total, page, pageSize])

  const { data: proposalsRaw, isLoading: loadingDetails, refetch: refetchDetails } = useReadContracts({
    contracts: ids.map((id) => ({
      abi: CONTRACTS.plotVoting.abi,
      address: CONTRACTS.plotVoting.address,
      functionName: 'getProposal',
      args: [id],
    })),
    allowFailure: true,
  })

  const proposals: ProposalView[] = useMemo(() => {
    if (!proposalsRaw || !ids.length) return []
    return proposalsRaw.map((res, idx) => {
      const id = ids[idx]
      if (!res || res.status !== 'success')
        return {
          id,
          storyId: 0n,
          author: '0x0000000000000000000000000000000000000000',
          contentHash: '',
          chapterNumber: 0n,
          voteCount: 0n,
          stakeAmount: 0n,
          deadline: 0n,
          executed: false,
          rejected: false,
          totalVoters: 0n,
        }
      const [storyId, author, contentHash, chapterNumber, voteCount, stakeAmount, deadline, executed, rejected, totalVoters] =
        res.result as unknown as [bigint, `0x${string}`, string, bigint, bigint, bigint, bigint, boolean, boolean, bigint]
      return { id, storyId, author, contentHash, chapterNumber, voteCount, stakeAmount, deadline, executed, rejected, totalVoters }
    })
  }, [proposalsRaw, ids])

  const isLoading = loadingTotal || loadingDetails
  const refetch = async () => {
    await refetchTotal()
    await refetchDetails()
  }

  // Auto-refresh on key PlotVoting events
  useWatchContractEvent({
    address: CONTRACTS.plotVoting.address,
    abi: CONTRACTS.plotVoting.abi,
    eventName: 'ProposalSubmitted',
    onLogs: () => { void refetch() },
  })
  useWatchContractEvent({
    address: CONTRACTS.plotVoting.address,
    abi: CONTRACTS.plotVoting.abi,
    eventName: 'VoteCast',
    onLogs: () => { void refetch() },
  })
  useWatchContractEvent({
    address: CONTRACTS.plotVoting.address,
    abi: CONTRACTS.plotVoting.abi,
    eventName: 'ProposalExecuted',
    onLogs: () => { void refetch() },
  })
  useWatchContractEvent({
    address: CONTRACTS.plotVoting.address,
    abi: CONTRACTS.plotVoting.abi,
    eventName: 'ProposalRejected',
    onLogs: () => { void refetch() },
  })
  // Commit–reveal events
  useWatchContractEvent({
    address: CONTRACTS.plotVoting.address,
    abi: CONTRACTS.plotVoting.abi,
    eventName: 'VoteCommitted',
    onLogs: () => { void refetch() },
  })
  useWatchContractEvent({
    address: CONTRACTS.plotVoting.address,
    abi: CONTRACTS.plotVoting.abi,
    eventName: 'VoteRevealed',
    onLogs: () => { void refetch() },
  })

  return { total, ids, proposals, isLoading, refetch, page, pageSize, totalItems, totalPages }
}
