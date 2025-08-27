import { FaBookOpen, FaUsers, FaVoteYea, FaCoins, FaShieldAlt, FaRocket, FaGlobe, FaLock } from 'react-icons/fa'

const features = [
  {
    icon: FaBookOpen,
    title: 'Collaborative Storytelling',
    description: 'Join forces with writers worldwide to create epic narratives. Every chapter is a collective masterpiece.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FaVoteYea,
    title: 'Democratic Plot Development',
    description: 'Vote on story directions using your staked tokens. Your voice shapes the narrative.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: FaCoins,
    title: 'Earn While You Read',
    description: 'Stake tokens on winning chapters and share in the revenue. Reading becomes rewarding.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: FaShieldAlt,
    title: 'Reputation System',
    description: 'Build your reputation through quality contributions and successful predictions.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FaRocket,
    title: 'NFT Ownership',
    description: 'Own your favorite chapters as unique NFTs. Collect, trade, and showcase your story collection.',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: FaGlobe,
    title: 'Decentralized Platform',
    description: 'Built on blockchain technology for transparency, security, and community governance.',
    color: 'from-indigo-500 to-purple-500'
  }
]

export function FeatureSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StoryVerse
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of storytelling with cutting-edge blockchain technology, 
            community-driven narratives, and real rewards for participation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-background rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <FaLock className="h-4 w-4" />
            <span>100% Secure & Transparent</span>
          </div>
        </div>
      </div>
    </section>
  )
}

