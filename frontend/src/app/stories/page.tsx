'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { FaBookOpen, FaSearch, FaFilter, FaEye, FaVoteYea, FaClock, FaUser } from 'react-icons/fa'
import { useStoryNFT } from '@/hooks/useStoryNFT'

type UiStory = {
  id: number
  title: string
  description: string
  author: string
  coverImage?: string
  genre: string[]
  totalChapters: number
  isCompleted: boolean
  createdAt: number
  updatedAt: number
  readerCount: number
  voteCount: number
}

const genres = ['All', 'Science Fiction', 'Fantasy', 'Cyberpunk', 'Mystery', 'Adventure', 'Drama', 'Thriller', 'Young Adult', 'Magic']

export default function StoriesPage() {
  const { stories, loading } = useStoryNFT()
  const mappedStories: UiStory[] = useMemo(() => {
    return (stories || []).map(s => ({
      id: Number(s.id),
      title: s.title,
      description: s.content,
      author: s.author,
      coverImage: '/api/placeholder/400/300',
      genre: [],
      totalChapters: 0,
      isCompleted: false,
      createdAt: Number(s.timestamp) * 1000 || Date.now(),
      updatedAt: Number(s.timestamp) * 1000 || Date.now(),
      readerCount: 0,
      voteCount: 0,
    }))
  }, [stories])

  const [filteredStories, setFilteredStories] = useState<UiStory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'recent'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Initialize filtered stories when mappedStories changes
  useEffect(() => {
    setFilteredStories(mappedStories)
  }, [mappedStories])

  // Filter and sort stories
  useEffect(() => {
    let filtered = mappedStories.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGenre = selectedGenre === 'All' || story.genre.includes(selectedGenre)
      return matchesSearch && matchesGenre
    })

    // Sort stories
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'popular':
        filtered.sort((a, b) => b.readerCount - a.readerCount)
        break
      case 'recent':
        filtered.sort((a, b) => b.updatedAt - a.updatedAt)
        break
    }

    setFilteredStories(filtered)
  }, [mappedStories, searchTerm, selectedGenre, sortBy])

  const formatDate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / 86400000)
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Discover{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Stories
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore collaborative stories from our community. Vote on plot directions, 
            contribute chapters, and earn rewards for your participation.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
            >
              <FaFilter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'recent')}
              className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Sort stories by"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedGenre === genre
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground">Loading stories from chain…</div>
          )}
          {!loading && filteredStories.map((story) => (
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
                    <span className="font-medium">
                      {Math.round((story.totalChapters / 20) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(story.totalChapters / 20) * 100}%` }}
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
                    <span>{formatDate(story.updatedAt)}</span>
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

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="text-center py-16">
            <FaBookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No stories found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedGenre('All')
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Create Story CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white font-semibold text-lg shadow-lg">
            <FaBookOpen className="h-6 w-6" />
            <span>Ready to Create Your Own Story?</span>
          </div>
          <p className="text-muted-foreground mt-4">
            Start writing and let the community help shape your narrative
          </p>
          <Link
            href="/create"
            className="inline-block mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Create Story
          </Link>
        </div>
      </div>
    </div>
  )
}
