'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { liskSepolia } from 'wagmi/chains'

export function NetworkBanner() {
  const { isConnected, chain } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected) return null
  if (chain?.id === liskSepolia.id) return null

  return (
    <div className="w-full bg-amber-100 text-amber-900 border-b border-amber-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-sm">
        <div>
          You are connected to <span className="font-semibold">{chain?.name ?? 'Unknown'}</span>. Switch to <span className="font-semibold">Lisk Sepolia</span> to use the app.
        </div>
        <button
          onClick={() => switchChain({ chainId: liskSepolia.id })}
          disabled={isPending}
          className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {isPending ? 'Switching…' : 'Switch Network'}
        </button>
      </div>
    </div>
  )
}
