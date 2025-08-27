import Link from 'next/link'
import { FaBookOpen, FaUsers, FaVoteYea, FaCoins, FaRocket, FaArrowRight, FaPlay } from 'react-icons/fa'
import { HeroSection } from '@/components/layout/HeroSection'
import { FeatureSection } from '@/components/layout/FeatureSection'
import { HowItWorksSection } from '@/components/layout/HowItWorksSection'
import { FeaturedStoriesSection } from '@/components/layout/FeaturedStoriesSection'
import { CTASection } from '@/components/layout/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features */}
      <FeatureSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Featured Stories */}
      <FeaturedStoriesSection />
      
      {/* Call to Action */}
      <CTASection />
    </div>
  )
}
