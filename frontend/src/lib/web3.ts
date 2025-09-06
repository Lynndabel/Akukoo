import { createConfig, http, createStorage } from 'wagmi'
import { mainnet, polygon, sepolia, polygonMumbai, liskSepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'
import { PlotVotingABI } from '@/types/abis/PlotVoting'
import { StoryNFTABI } from '@/types/abis/StoryNFT'

export const queryClient = new QueryClient()

// Prefer the correct name, but also support a legacy/spelled variant
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
if (typeof window !== 'undefined' && !wcProjectId) {
  // Surface a clear warning in the browser console if WC project id is missing
  // This impacts AppKit modal as well.
  console.warn('[WalletConnect] Missing Project ID. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (preferred) or NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID. WalletConnect/AppKit may not work.')
}

// Configure chains
const chains = [liskSepolia, mainnet, polygon, sepolia, polygonMumbai] as const;

// Create wagmiConfig
export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      showQrModal: true,
    })
  ],
  transports: {
    [liskSepolia.id]: http(process.env.NEXT_PUBLIC_LISK_SEPOLIA_RPC_URL || 'https://rpc.sepolia-api.lisk.com'),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  })
});

// Contract addresses (deployed on Lisk Sepolia)
export const CONTRACT_ADDRESSES = {
  storyNFT: '0xAbeC33ffedB0F6cf5eEFe69401C24DD24d6DF2e5',
  plotVoting: '0x941663b89ffC5B314422C63ce3Bba5Fe616f6b9d',
  storyTreasury: '0x514a020F8B663624e249B93651A8952397D8259c',
  reputationStaking: '0x991C63EEd04DB2bD9Aa1c91459C437A2BEe0966e',
} as const

// Contract ABIs
export const CONTRACT_ABIS = {
  storyNFT: StoryNFTABI,
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

