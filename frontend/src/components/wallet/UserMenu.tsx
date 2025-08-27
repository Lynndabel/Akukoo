'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { formatAddress } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { 
  FaUser, 
  FaChevronDown, 
  FaSignOutAlt, 
  FaCog, 
  FaBookmark,
  FaTrophy,
  FaWallet
} from 'react-icons/fa'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { address, disconnectWallet } = useWallet()
  const { userProfile } = useAppStore()

  const handleDisconnect = () => {
    disconnectWallet()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
          "bg-accent text-accent-foreground hover:bg-accent/80",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <FaUser className="h-3 w-3 text-primary" />
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {userProfile?.displayName || formatAddress(address || '')}
        </span>
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
              {/* User Info */}
              <div className="mb-4 pb-3 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <FaUser className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {userProfile?.displayName || 'Anonymous Writer'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatAddress(address || '')}
                    </p>
                  </div>
                </div>
                
                {userProfile && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Reputation</span>
                    <span className="font-medium text-foreground">
                      {userProfile.reputationScore}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Menu Items */}
              <div className="space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <FaUser className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/my-stories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <FaBookmark className="h-4 w-4" />
                  <span>My Stories</span>
                </Link>
                
                <Link
                  href="/earnings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <FaTrophy className="h-4 w-4" />
                  <span>Earnings</span>
                </Link>
                
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <FaCog className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </div>
              
              {/* Disconnect */}
              <div className="mt-4 pt-3 border-t border-border">
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

