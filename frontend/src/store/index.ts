import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Story, Chapter, Proposal, UserProfile, Network, WalletStatus } from '@/types'

interface AppState {
  // Wallet & Connection
  walletStatus: WalletStatus
  address: string | null
  network: Network | null
  isConnected: boolean
  
  // User Data
  userProfile: UserProfile | null
  
  // Stories & Content
  stories: Story[]
  currentStory: Story | null
  chapters: Chapter[]
  currentChapter: Chapter | null
  
  // Voting & Proposals
  proposals: Proposal[]
  userVotes: Map<number, bigint> // proposalId -> voteAmount
  
  // UI State
  isLoading: boolean
  error: string | null
  theme: 'light' | 'dark'
  
  // Actions
  setWalletStatus: (status: WalletStatus) => void
  setAddress: (address: string | null) => void
  setNetwork: (network: Network | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  setStories: (stories: Story[]) => void
  setCurrentStory: (story: Story | null) => void
  setChapters: (chapters: Chapter[]) => void
  setCurrentChapter: (chapter: Chapter | null) => void
  setProposals: (proposals: Proposal[]) => void
  addUserVote: (proposalId: number, amount: bigint) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  walletStatus: 'disconnected' as WalletStatus,
  address: null,
  network: null,
  isConnected: false,
  userProfile: null,
  stories: [],
  currentStory: null,
  chapters: [],
  currentChapter: null,
  proposals: [],
  userVotes: new Map(),
  isLoading: false,
  error: null,
  theme: 'light' as const,
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setWalletStatus: (status) => set({ 
        walletStatus: status, 
        isConnected: status === 'connected' 
      }),
      
      setAddress: (address) => set({ address }),
      
      setNetwork: (network) => set({ network }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setStories: (stories) => set({ stories }),
      
      setCurrentStory: (story) => set({ currentStory: story }),
      
      setChapters: (chapters) => set({ chapters }),
      
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
      
      setProposals: (proposals) => set({ proposals }),
      
      addUserVote: (proposalId, amount) => {
        const userVotes = new Map(get().userVotes)
        userVotes.set(proposalId, amount)
        set({ userVotes })
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setTheme: (theme) => set({ theme }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'story-game-store',
    }
  )
)

