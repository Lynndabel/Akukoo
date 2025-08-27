'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { cn } from '@/lib/utils'
import { FaWallet, FaChevronDown, FaMask, FaMobile } from 'react-icons/fa'

export function ConnectWalletButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { connectors, connectWallet, isPending } = useWallet()

  // Debug connectors
  console.log('ConnectWalletButton - Available connectors:', connectors)

  const handleConnect = async (connectorId: string) => {
    // Find the connector by ID
    const connector = connectors.find(c => c.id === connectorId)
    console.log('Attempting to connect with:', connector)
    if (connector) {
      await connectWallet(connectorId)
      setIsOpen(false)
    }
  }

  const getConnectorIcon = (name: string) => {
    if (name.toLowerCase().includes('metamask')) return <FaMask className="h-4 w-4" />
    if (name.toLowerCase().includes('walletconnect')) return <FaMobile className="h-4 w-4" />
    return <FaWallet className="h-4 w-4" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <FaWallet className="h-4 w-4" />
        <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
        <FaChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-background shadow-lg z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Choose your wallet
              </h3>
              
              <div className="space-y-2">
                {connectors.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No wallets available
                  </div>
                ) : (
                  connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector.id)}
                      disabled={!connector.ready || isPending}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      )}
                    >
                      {getConnectorIcon(connector.name)}
                      <span className="text-sm font-medium">
                        {connector.name}
                      </span>
                      {!connector.ready && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          (Unavailable)
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  New to Web3?{' '}
                  <a 
                    href="https://ethereum.org/en/wallets/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Learn more about wallets
                  </a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

