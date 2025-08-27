'use client'

import { Component, ReactNode } from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <FaExclamationTriangle className="h-10 w-10 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            
            <p className="text-muted-foreground mb-6 max-w-md">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FaRedo className="h-4 w-4" />
                <span>Refresh Page</span>
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="block mx-auto px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Try Again
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-6 text-left max-w-md mx-auto">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground bg-muted p-3 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

