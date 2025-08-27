'use client'

import { useMemo, useState } from 'react'
import { FaVoteYea } from 'react-icons/fa'
import { usePlotVoting } from '@/hooks/usePlotVoting'
import { useProposals } from '@/hooks/useProposals'
import { useChainId } from 'wagmi'
import toast from 'react-hot-toast'
import { formatEther } from 'viem'

export default function VotingPage() {
  const { isConnected, vote, stakeForProposal, executeProposal, rejectProposal, tx } = usePlotVoting()
  const chainId = useChainId()
  const [storyFilter, setStoryFilter] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const pageSize = 10
  const parsedStoryId = (() => { try { return storyFilter ? BigInt(storyFilter) : undefined } catch { return undefined } })()
  const { proposals, isLoading: isLoadingProposals, refetch, totalPages, totalItems } = useProposals({ pageSize, page, storyId: parsedStoryId as unknown as bigint | undefined })

  const [proposalId, setProposalId] = useState<string>('')
  const [voteAmount, setVoteAmount] = useState<string>('1')
  const [stakeEth, setStakeEth] = useState<string>('0.1')

  const parsedProposalId = (() => {
    try { return BigInt(proposalId || '0') } catch { return 0n }
  })()
  const parsedVoteAmount = (() => {
    try { return BigInt(voteAmount || '0') } catch { return 0n }
  })()

  const getErrorMessage = (e: unknown) => {
    if (typeof e === 'object' && e !== null && 'message' in e) {
      const msg = (e as { message?: unknown }).message
      return typeof msg === 'string' ? msg : 'Transaction failed'
    }
    return 'Transaction failed'
  }

  const disabled = !isConnected || !parsedProposalId || tx.isPending || tx.isConfirming

  const explorerBase = useMemo(() => {
    switch (chainId) {
      case 1: return 'https://etherscan.io'
      case 11155111: return 'https://sepolia.etherscan.io'
      case 137: return 'https://polygonscan.com'
      case 80001: return 'https://mumbai.polygonscan.com'
      default: return 'https://etherscan.io'
    }
  }, [chainId])

  const onVote = async () => {
    if (!parsedProposalId) return toast.error('Enter a valid Proposal ID')
    if (parsedVoteAmount <= 0n) return toast.error('Vote amount must be greater than 0')
    try {
      const p = toast.loading('Submitting vote…')
      await vote(parsedProposalId, parsedVoteAmount)
      toast.dismiss(p)
      toast.success('Vote submitted')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
    }
  }

  const onStake = async () => {
    if (!parsedProposalId) return toast.error('Enter a valid Proposal ID')
    if (!stakeEth || Number(stakeEth) <= 0) return toast.error('Stake must be > 0')
    try {
      const p = toast.loading('Submitting stake…')
      await stakeForProposal(parsedProposalId, stakeEth)
      toast.dismiss(p)
      toast.success('Stake submitted')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
    }
  }

  const onExecute = async () => {
    if (!parsedProposalId) return toast.error('Enter a valid Proposal ID')
    try {
      const p = toast.loading('Executing proposal…')
      await executeProposal(parsedProposalId)
      toast.dismiss(p)
      toast.success('Proposal executed')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
    }
  }

  const onReject = async () => {
    if (!parsedProposalId) return toast.error('Enter a valid Proposal ID')
    try {
      const p = toast.loading('Rejecting proposal…')
      await rejectProposal(parsedProposalId)
      toast.dismiss(p)
      toast.success('Proposal rejected')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Vote on{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chapter Proposals
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cast free votes on chapter proposals and optionally stake ETH to earn rewards if your chosen proposal wins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FaVoteYea className="text-primary" /> Voting & Staking
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="col-span-1 sm:col-span-3">
                <label className="block text-sm text-muted-foreground mb-1">Proposal ID</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                  placeholder="e.g. 1"
                  value={proposalId}
                  onChange={(e) => setProposalId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Vote Amount</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                  value={voteAmount}
                  onChange={(e) => setVoteAmount(e.target.value)}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Stake (ETH)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                  value={stakeEth}
                  onChange={(e) => setStakeEth(e.target.value)}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  className="w-full sm:w-auto rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
                  disabled={disabled || parsedVoteAmount === 0n}
                  onClick={onVote}
                >
                  Free Vote
                </button>

                <button
                  className="w-full sm:w-auto rounded-md bg-secondary px-4 py-2 text-white disabled:opacity-50"
                  disabled={disabled || Number(stakeEth) <= 0}
                  onClick={onStake}
                >
                  Stake on Proposal
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-medium mb-3">Admin Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
                  disabled={disabled}
                  onClick={onExecute}
                >
                  Execute Proposal
                </button>
                <button
                  className="rounded-md bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
                  disabled={disabled}
                  onClick={onReject}
                >
                  Reject Proposal
                </button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              {tx.hash && <div>Tx: <a className="underline" target="_blank" rel="noreferrer" href={`${explorerBase}/tx/${tx.hash}`}>{tx.hash}</a></div>}
              {tx.lastAction && <div>Last action: {tx.lastAction}</div>}
              {tx.isPending && <div>Submitting transaction…</div>}
              {tx.isConfirming && <div>Waiting for confirmation…</div>}
              {tx.isConfirmed && <div className="text-emerald-500">Confirmed ✅</div>}
              {tx.writeError && <div className="text-rose-500">Error: {String(tx.writeError.message || tx.writeError)}</div>}
              {tx.confirmError && <div className="text-rose-500">Confirm Error: {String(tx.confirmError.message || tx.confirmError)}</div>}
              {!isConnected && <div>Please connect your wallet to interact.</div>}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Proposals</h2>
            <div className="mb-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm text-muted-foreground mb-1">Filter by Story ID (optional)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2"
                  placeholder="e.g. 1"
                  value={storyFilter}
                  onChange={(e) => { setStoryFilter(e.target.value); setPage(1) }}
                  min={0}
                />
              </div>
              <button className="text-sm underline" onClick={() => setStoryFilter('')}>Clear</button>
            </div>
            <div className="space-y-3">
              {isLoadingProposals && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-muted/60" />
                  ))}
                </div>
              )}
              {!isLoadingProposals && proposals.length === 0 && (
                <div className="text-sm text-muted-foreground">No proposals yet.</div>
              )}
              {!isLoadingProposals && proposals.map((p) => {
                const status = p.executed ? 'Executed' : p.rejected ? 'Rejected' : 'Active'
                const deadlineDate = p.deadline > 0n ? new Date(Number(p.deadline) * 1000) : null
                const stakeEth = (() => { try { return formatEther(p.stakeAmount) } catch { return '0' } })()
                return (
                  <button
                    key={String(p.id)}
                    onClick={() => setProposalId(String(p.id))}
                    className="w-full text-left border border-border rounded-lg p-3 hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Proposal #{String(p.id)} · Story {String(p.storyId)} · Chapter {String(p.chapterNumber)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status==='Active' ? 'bg-amber-100 text-amber-700' : status==='Executed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Votes: {String(p.voteCount)} · Staked: {stakeEth} ETH · Voters: {String(p.totalVoters)}
                    </div>
                    {deadlineDate && (
                      <div className="text-xs text-muted-foreground">Deadline: {deadlineDate.toLocaleString()}</div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Total: {totalItems ?? 0}</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >Prev</button>
                <div className="text-sm">Page {page} / {totalPages ?? 1}</div>
                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  disabled={!totalPages || page >= totalPages}
                  onClick={() => setPage((p) => (!totalPages ? p : Math.min(totalPages, p + 1)))}
                >Next</button>
              </div>
              <button className="text-sm underline" onClick={() => refetch()}>Refresh</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

