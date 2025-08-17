export interface Story {
  id: number
  title: string
  description: string
  author: string
  coverImage?: string
  genre: string[]
  totalChapters: number
  isCompleted: boolean
  createdAt: number
  updatedAt: number
  readerCount: number
  voteCount: number
}

export interface Chapter {
  id: number
  storyId: number
  chapterNumber: number
  author: string
  contentHash: string
  content?: string
  voteCount: number
  timestamp: number
  nftTokenId?: number
}

export interface Proposal {
  id: number
  storyId: number
  author: string
  contentHash: string
  content?: string
  chapterNumber: number
  voteCount: number
  stakeAmount: bigint
  deadline: number
  executed: boolean
  totalVoterStakes: bigint
}

export interface UserProfile {
  address: string
  displayName: string
  avatar?: string
  reputationScore: number
  totalStaked: bigint
  totalEarnings: bigint
  role: 'reader' | 'writer' | 'both'
  joinedAt: number
}

export interface Vote {
  proposalId: number
  voter: string
  amount: bigint
  timestamp: number
}

export interface RevenueShare {
  tokenId: number
  authorShare: bigint
  voterShare: bigint
  platformShare: bigint
  distributedAt: number
}

export interface ReputationCommitment {
  id: number
  user: string
  commitmentType: string
  amount: bigint
  duration: number
  deadline: number
  completed: boolean
  slashed: boolean
}

export type Network = 'ethereum' | 'polygon' | 'sepolia' | 'mumbai'
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
