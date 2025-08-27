'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import { FaBookOpen, FaUsers, FaVoteYea, FaCoins, FaRocket, FaArrowRight, FaPlay, FaWallet } from 'react-icons/fa'
import { ConnectWalletButton } from '../wallet/ConnectWalletButton'

export function HeroSection() {
  const { isConnected } = useWallet()
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayDemo = () => {
    setIsPlaying(true)
    // Add demo logic here
    setTimeout(() => setIsPlaying(false), 3000)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FaRocket className="h-4 w-4" />
              <span>Revolutionizing Storytelling with Blockchain</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Write the Future of
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Collaborative Stories
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join a decentralized community where readers and writers collaborate to create 
              epic narratives. Vote on plot directions, earn rewards, and own your favorite 
              chapters as NFTs.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {isConnected ? (
              <Link
                href="/stories"
                className="group flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Explore Stories</span>
                <FaArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <ConnectWalletButton />
            )}
            
            <button
              onClick={handlePlayDemo}
              disabled={isPlaying}
              className="flex items-center space-x-2 px-8 py-4 border-2 border-border bg-background text-foreground rounded-xl font-semibold text-lg hover:bg-accent hover:border-primary transition-all duration-200 transform hover:scale-105"
            >
              <FaPlay className={isPlaying ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
              <span>{isPlaying ? 'Loading Demo...' : 'Try Demo'}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Active Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1M+</div>
              <div className="text-sm text-muted-foreground">Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$500K+</div>
              <div className="text-sm text-muted-foreground">Rewards Distributed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block animate-float">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
          <FaBookOpen className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="absolute top-1/3 right-20 hidden lg:block animate-float delay-1000">
        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
          <FaUsers className="h-6 w-6 text-secondary" />
        </div>
      </div>
      
      <div className="absolute bottom-1/4 left-20 hidden lg:block animate-float delay-2000">
        <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center">
          <FaVoteYea className="h-7 w-7 text-accent" />
        </div>
      </div>
      
      <div className="absolute bottom-1/3 right-10 hidden lg:block animate-float delay-3000">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <FaCoins className="h-5 w-5 text-primary" />
        </div>
      </div>
    </section>
  )
}

