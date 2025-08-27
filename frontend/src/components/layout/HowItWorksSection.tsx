import { FaBookOpen, FaPencilAlt, FaVoteYea, FaCoins, FaRocket, FaUsers } from 'react-icons/fa'

const steps = [
  {
    number: '01',
    icon: FaBookOpen,
    title: 'Discover Stories',
    description: 'Browse through a collection of collaborative stories or start your own narrative journey.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    number: '02',
    icon: FaPencilAlt,
    title: 'Submit Proposals',
    description: 'Writers submit chapter proposals with their creative vision and stake reputation tokens.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    number: '03',
    icon: FaVoteYea,
    title: 'Community Voting',
    description: 'Readers vote on proposals using staked tokens. Higher stakes mean more voting power.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    number: '04',
    icon: FaRocket,
    title: 'Chapter Creation',
    description: 'Winning proposals become official chapters, minted as NFTs on the blockchain.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    number: '05',
    icon: FaCoins,
    title: 'Revenue Distribution',
    description: 'Revenue from NFT sales is automatically distributed to authors, voters, and the platform.',
    color: 'from-red-500 to-pink-500'
  },
  {
    number: '06',
    icon: FaUsers,
    title: 'Community Growth',
    description: 'Build reputation, earn rewards, and contribute to the evolving story ecosystem.',
    color: 'from-indigo-500 to-purple-500'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StoryVerse
            </span>{' '}
            Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From story discovery to earning rewards, here's your complete guide to participating 
            in the future of collaborative storytelling.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative p-8 bg-muted/50 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white font-semibold text-lg shadow-lg">
            <FaRocket className="h-6 w-6" />
            <span>Ready to Start Your Story Journey?</span>
          </div>
          <p className="text-muted-foreground mt-4">
            Connect your wallet and join thousands of storytellers and readers
          </p>
        </div>
      </div>
    </section>
  )
}

