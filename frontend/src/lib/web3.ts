import { createConfig, http, createStorage } from 'wagmi'
import { mainnet, polygon, sepolia, polygonMumbai } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const config = createConfig({
  chains: [mainnet, polygon, sepolia, polygonMumbai],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  storage: createStorage({ storage: typeof window !== 'undefined' ? window.localStorage : undefined }),
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
  },
})

// Contract addresses (update these with your deployed contracts)
export const CONTRACT_ADDRESSES = {
  storyNFT: '0x...', // Update with your deployed address
  plotVoting: '0x...', // Update with your deployed address
  storyTreasury: '0x...', // Update with your deployed address
  reputationStaking: '0x...', // Update with your deployed address
} as const

// Contract ABIs (you'll need to import these from your contracts)
export const CONTRACT_ABIS = {
  storyNFT: [], // Import from your StoryNFT contract
  plotVoting: [], // Import from your PlotVoting contract
  storyTreasury: [], // Import from your StoryTreasury contract
  reputationStaking: [], // Import from your ReputationStaking contract
} as const
