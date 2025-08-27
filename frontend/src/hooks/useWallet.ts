import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useAppStore } from '@/store'
import { useEffect } from 'react'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()

  // Check if we're in the browser
  const isBrowser = typeof window !== 'undefined'

  const {
    walletStatus,
    setWalletStatus,
    setAddress,
    setNetwork,
    setLoading,
    setError,
    clearError,
  } = useAppStore()

  // Update store when wallet state changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletStatus('connected')
      setAddress(address)
      setNetwork(chainId ? getNetworkName(chainId) : null)
      clearError()
    } else {
      setWalletStatus('disconnected')
      setAddress(null)
      setNetwork(null)
    }
  }, [isConnected, address, chainId, setWalletStatus, setAddress, setNetwork, clearError])

  // Debug connectors
  useEffect(() => {
    console.log('Available connectors:', connectors)
    console.log('Connectors ready state:', connectors.map(c => ({ id: c.id, name: c.name, ready: c.ready })))
    console.log('Wagmi connectors:', connectors)
    console.log('Is browser:', isBrowser)
    console.log('Connectors length:', connectors.length)
  }, [connectors, isBrowser])

  // Update loading state
  useEffect(() => {
    setLoading(isPending)
  }, [isPending, setLoading])

  const connectWallet = async (connectorId: string) => {
    try {
      setWalletStatus('connecting')
      setError(null)

      const connector = connectors.find(c => c.id === connectorId)
      console.log('Connecting with connector:', connector)
      
      if (connector) {
        await connect({ connector })
      } else {
        throw new Error(`Connector with ID ${connectorId} not found`)
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      setWalletStatus('error')
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    try {
      disconnect()
      setWalletStatus('disconnected')
      setAddress(null)
      setNetwork(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet')
    }
  }

  const switchToNetwork = (newChainId: number) => {
    try {
      switchChain?.({ chainId: newChainId })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to switch network')
    }
  }

  return {
    // State
    address,
    isConnected,
    chainId,
    chains,
    walletStatus,
    isPending,

    // Actions
    connectWallet,
    disconnectWallet,
    switchToNetwork,

    // Available connectors
    connectors: connectors.map((connector) => ({
      id: connector.id,
      name: connector.name,
      ready: connector.ready,
    })).filter(connector => connector.ready), // Only show ready connectors
  }
}

function getNetworkName(chainId: number): 'ethereum' | 'polygon' | 'sepolia' | 'mumbai' | null {
  switch (chainId) {
    case 1:
      return 'ethereum'
    case 137:
      return 'polygon'
    case 11155111:
      return 'sepolia'
    case 80001:
      return 'mumbai'
    default:
      return null
  }
}
