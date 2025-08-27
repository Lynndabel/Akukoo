'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import { 
  FaBookOpen, 
  FaWallet, 
  FaUser, 
  FaBars, 
  FaTimes,
  FaMoon,
  FaSun
} from 'react-icons/fa'
import { ConnectWalletButton } from '../wallet/ConnectWalletButton'
import { UserMenu } from '../wallet/UserMenu'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isConnected } = useWallet()
  const { theme, setTheme } = useAppStore()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FaBookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">StoryVerse</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/stories" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Stories
            </Link>
            <Link 
              href="/create" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Create
            </Link>
            <Link 
              href="/voting" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Voting
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon className="h-4 w-4" /> : <FaSun className="h-4 w-4" />}
            </button>

            {/* Wallet Connection */}
            {isConnected ? (
              <UserMenu />
            ) : (
              <ConnectWalletButton />
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/stories" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Stories
              </Link>
              <Link 
                href="/create" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create
              </Link>
              <Link 
                href="/voting" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Voting
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

