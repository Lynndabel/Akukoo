import Link from 'next/link'
import { FaBookOpen, FaUser, FaVoteYea, FaEye, FaClock, FaTag } from 'react-icons/fa'

// Sample featured stories data
const featuredStories = [
  {
    id: 1,
    title: 'The Quantum Chronicles',
    description: 'A sci-fi epic where humanity discovers parallel dimensions through quantum technology.',
    author: '0x7a8b9c...',
    coverImage: '/api/placeholder/400/300',
    genre: ['Science Fiction', 'Adventure'],
    totalChapters: 12,
    isCompleted: false,
    readerCount: 15420,
    voteCount: 8920,
    lastUpdated: Date.now() - 86400000, // 1 day ago
    progress: 75
  },
  {
    id: 2,
    title: 'Ethereal Realms',
    description: 'A fantasy tale of magic, dragons, and the eternal battle between light and darkness.',
    author: '0x3f4e5d...',
    coverImage: '/api/placeholder/400/300',
    genre: ['Fantasy', 'Magic'],
    totalChapters: 8,
    isCompleted: true,
    readerCount: 23450,
    voteCount: 15670,
    lastUpdated: Date.now() - 172800000, // 2 days ago
    progress: 100
  },
  {
    id: 3,
    title: 'Cyberpunk 2077: Origins',
    description: 'The untold story of how Night City became the technological marvel it is today.',
    author: '0x1a2b3c...',
    coverImage: '/api/placeholder/400/300',
    genre: ['Cyberpunk', 'Thriller'],
    totalChapters: 15,
    isCompleted: false,
    readerCount: 18930,
    voteCount: 11240,
    lastUpdated: Date.now() - 43200000, // 12 hours ago
    progress: 60
  }
]

export function FeaturedStoriesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Featured{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the most popular and trending collaborative stories from our community. 
            Each one is a unique journey waiting to be explored.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredStories.map((story) => (
            <div
              key={story.id}
              className="group bg-background rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                <div className="absolute top-4 right-4">
                  {story.isCompleted ? (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Ongoing
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span className="font-medium">{story.totalChapters} Chapters</span>
                    <span className="font-medium">{story.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${story.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {story.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {story.description}
                </p>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.genre.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <FaEye className="h-3 w-3" />
                      <span>{story.readerCount.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaVoteYea className="h-3 w-3" />
                      <span>{story.voteCount.toLocaleString()}</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <FaClock className="h-3 w-3" />
                    <span>{Math.floor((Date.now() - story.lastUpdated) / 3600000)}h ago</span>
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <FaUser className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {story.author}
                    </span>
                  </div>
                  
                  <Link
                    href={`/stories/${story.id}`}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Read Story
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Stories */}
        <div className="text-center">
          <Link
            href="/stories"
            className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            <FaBookOpen className="h-5 w-5" />
            <span>View All Stories</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

