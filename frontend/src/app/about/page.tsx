import { FaBookOpen, FaUsers, FaVoteYea, FaCoins, FaShieldAlt, FaRocket, FaGlobe, FaLock, FaHeart, FaStar, FaUser } from 'react-icons/fa'

const teamMembers = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Blockchain enthusiast and storyteller with 10+ years in decentralized systems.',
    avatar: '/api/placeholder/100/100'
  },
  {
    name: 'Sarah Kim',
    role: 'CTO',
    bio: 'Smart contract developer specializing in DeFi and NFT protocols.',
    avatar: '/api/placeholder/100/100'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Head of Community',
    bio: 'Community builder with experience in DAOs and collaborative platforms.',
    avatar: '/api/placeholder/100/100'
  }
]

const milestones = [
  {
    year: '2024',
    title: 'Platform Launch',
    description: 'StoryVerse goes live with core storytelling and voting features.'
  },
  {
    year: '2025',
    title: 'Community Growth',
    description: 'Reach 100K+ active users and 1000+ collaborative stories.'
  },
  {
    year: '2026',
    title: 'Ecosystem Expansion',
    description: 'Launch mobile apps and expand to multiple blockchain networks.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StoryVerse
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing storytelling by combining the power of blockchain technology 
            with the creativity of global communities.
          </p>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-background rounded-2xl border border-border p-8 text-center">
            <FaHeart className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To democratize storytelling by creating a platform where readers and writers 
              collaborate equally, where every voice matters, and where creativity is rewarded 
              through transparent, blockchain-based systems.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Community-Driven</h3>
              <p className="text-muted-foreground">
                Every story is shaped by the collective wisdom and creativity of our global community.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCoins className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Fair Rewards</h3>
              <p className="text-muted-foreground">
                Contributors are automatically rewarded for their valuable contributions to stories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGlobe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Global Access</h3>
              <p className="text-muted-foreground">
                Anyone, anywhere can participate in creating and shaping amazing narratives.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">How StoryVerse Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Create</h3>
              <p className="text-sm text-muted-foreground">
                Writers start stories and submit chapter proposals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Vote</h3>
              <p className="text-sm text-muted-foreground">
                Community votes on proposals using staked tokens
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Mint</h3>
              <p className="text-sm text-muted-foreground">
                Winning proposals become NFT chapters
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Earn</h3>
              <p className="text-sm text-muted-foreground">
                Revenue is distributed to contributors
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-background rounded-2xl border border-border p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaUser className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-background rounded-2xl border border-border p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {milestone.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background rounded-2xl border border-border p-6">
              <FaShieldAlt className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                All voting, rewards, and story decisions are transparent and verifiable on the blockchain.
              </p>
            </div>
            <div className="bg-background rounded-2xl border border-border p-6">
              <FaHeart className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">Inclusivity</h3>
              <p className="text-muted-foreground">
                We welcome creators and readers from all backgrounds and skill levels.
              </p>
            </div>
            <div className="bg-background rounded-2xl border border-border p-6">
              <FaStar className="h-8 w-8 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">Quality</h3>
              <p className="text-muted-foreground">
                We believe in the power of community curation to surface the best content.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Join the Revolution?</h2>
            <p className="text-lg mb-6 opacity-90">
              Connect your wallet and start your journey in collaborative storytelling today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/stories"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Explore Stories
              </a>
              <a
                href="/create"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary transition-colors"
              >
                Create Story
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
