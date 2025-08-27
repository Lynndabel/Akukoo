'use client'

import { useWallet } from '@/hooks/useWallet'
import { FaRocket, FaBookOpen, FaUsers, FaArrowRight, FaStar } from 'react-icons/fa'
import { ConnectWalletButton } from '../wallet/ConnectWalletButton'

export function CTASection() {
  const { isConnected } = useWallet()

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Write the{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Future of Stories
              </span>
              ?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of writers and readers who are already shaping the future of 
              collaborative storytelling. Connect your wallet and start your journey today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {isConnected ? (
                <a
                  href="/stories"
                  className="group flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <FaBookOpen className="h-5 w-5" />
                  <span>Explore Stories</span>
                  <FaArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <ConnectWalletButton />
              )}
              
              <a
                href="/about"
                className="flex items-center space-x-2 px-8 py-4 border-2 border-border bg-background text-foreground rounded-xl font-semibold text-lg hover:bg-accent hover:border-primary transition-all duration-200"
              >
                <FaUsers className="h-5 w-5" />
                <span>Learn More</span>
              </a>
            </div>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Active Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Stories in Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$500K+</div>
              <div className="text-sm text-muted-foreground">Total Rewards Distributed</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border">
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="h-5 w-5 text-yellow-500" />
              ))}
            </div>
            <blockquote className="text-lg text-muted-foreground mb-4 italic">
              "StoryVerse has completely changed how I think about storytelling. The community 
              collaboration and earning potential make every chapter an exciting adventure."
            </blockquote>
            <cite className="text-sm text-foreground font-medium">
              — Alex Chen, Award-winning Author
            </cite>
          </div>

          {/* Final CTA */}
          <div className="mt-12">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-medium">
              <FaRocket className="h-4 w-4" />
              <span>Join the Revolution Today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

