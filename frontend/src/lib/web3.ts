import { createConfig, http, createStorage } from 'wagmi'
import { mainnet, polygon, sepolia, polygonMumbai } from 'wagmi/chains'
import { defineChain } from 'viem'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'
import { PlotVotingABI } from '@/types/abis/PlotVoting'

export const queryClient = new QueryClient()

// Somnia Testnet chain definition (id 50312)
export const somnia = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Test Token', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL as string] },
    public: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL as string] },
  },
  blockExplorers: {
    default: { name: 'Somnia', url: 'https://testnet.somnia.network' },
  },
})

export const config = createConfig({
  chains: [somnia, mainnet, polygon, sepolia, polygonMumbai],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  storage: createStorage({ storage: typeof window !== 'undefined' ? window.localStorage : undefined }),
  transports: {
    [somnia.id]: http(process.env.NEXT_PUBLIC_SOMNIA_RPC_URL),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
  },
})

// Contract addresses (update these with your deployed contracts)
export const CONTRACT_ADDRESSES = {
  storyNFT: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519',
  // Prefer Somnia-specific env when connected to Somnia; fallback to generic var
  plotVoting: (process.env.NEXT_PUBLIC_PLOTVOTING_ADDRESS_SOMNIA || process.env.NEXT_PUBLIC_PLOTVOTING_ADDRESS) || '0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496',
  storyTreasury: '0x34A1D3fff3958843C43aD80F30b94c510645C316',
  reputationStaking: '0x90193C961A926261B756D1E5bb255e67ff9498A1',
} as const

// Contract ABIs (you'll need to import these from your contracts)
export const CONTRACT_ABIS = {
  storyNFT: [], // Import from your StoryNFT contract
  plotVoting: PlotVotingABI, // Minimal ABI for PlotVoting interactions
  storyTreasury: [], // Import from your StoryTreasury contract
  reputationStaking: [], // Import from your ReputationStaking contract
} as const

export const CONTRACTS = {
  plotVoting: {
    address: CONTRACT_ADDRESSES.plotVoting as `0x${string}`,
    abi: CONTRACT_ABIS.plotVoting,
  },
}

