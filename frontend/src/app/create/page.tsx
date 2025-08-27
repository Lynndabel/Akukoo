'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaBookOpen, FaPencilAlt, FaRocket, FaSave } from 'react-icons/fa'
import { useWallet } from '@/hooks/useWallet'
import { useAppStore } from '@/store'

const genres = [
  'Science Fiction', 'Fantasy', 'Cyberpunk', 'Mystery', 'Adventure', 
  'Drama', 'Thriller', 'Young Adult', 'Magic', 'Romance', 'Horror', 'Comedy'
]

export default function CreatePage() {
  const router = useRouter()
  const { isConnected } = useWallet()
  const { setLoading, setError } = useAppStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: [] as string[],
    coverImage: '',
    initialChapter: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not connected
  if (!isConnected) {
    router.push('/')
    return null
  }

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || formData.genre.length === 0) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      // TODO: Submit to smart contract
      // await createStory(formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to the new story
      router.push('/stories')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create story')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Create Your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Story
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start a new collaborative narrative and let the community help shape its destiny. 
            Your story could become the next epic adventure that thousands will follow.
          </p>
        </div>

        {/* Create Story Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-background rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                <FaBookOpen className="h-6 w-6 text-primary" />
                <span>Story Information</span>
              </h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your story title..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Story Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your story's premise, setting, and main characters..."
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
                    required
                  />
                </div>

                {/* Genre Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Genres * (Select 1-3)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.genre.includes(genre)
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {formData.genre.length > 3 && (
                    <p className="text-sm text-red-500 mt-2">
                      Please select no more than 3 genres
                    </p>
                  )}
                </div>

                {/* Cover Image */}
                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-foreground mb-2">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Initial Chapter */}
            <div className="bg-background rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                <FaPencilAlt className="h-6 w-6 text-primary" />
                <span>Initial Chapter</span>
              </h2>
              
              <div>
                <label htmlFor="initialChapter" className="block text-sm font-medium text-foreground mb-2">
                  Chapter 1 Content (Optional)
                </label>
                <textarea
                  id="initialChapter"
                  value={formData.initialChapter}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialChapter: e.target.value }))}
                  placeholder="Write the first chapter of your story to get readers hooked..."
                  rows={8}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You can start with just the story setup, or write the entire first chapter. 
                  The community will vote on future chapter proposals.
                </p>
              </div>
            </div>

            {/* Submission */}
            <div className="bg-background rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-3">
                <FaRocket className="h-6 w-6 text-primary" />
                <span>Launch Your Story</span>
              </h2>
              
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your story will be published and visible to the community</li>
                    <li>• Readers can start voting on chapter proposals</li>
                    <li>• Writers can submit new chapter proposals</li>
                    <li>• You'll earn rewards from successful chapters</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || formData.genre.length === 0 || formData.genre.length > 3}
                  className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg rounded-xl hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Story...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="h-5 w-5" />
                      <span>Create Story</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
