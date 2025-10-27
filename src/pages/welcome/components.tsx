import React from 'react'

interface LoadingStateProps {
  message?: string
  emoji?: string
}

/**
 * Reusable loading state component
 * Used during initial data fetch or validation
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  emoji = '🔥' 
}) => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">{emoji}</div>
          <p className="text-white text-2xl font-bold">{message}</p>
        </div>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  emoji?: string
}

/**
 * Reusable error state component
 * Used when initial data fetch fails
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message,
  emoji = '❌'
}) => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-4">{emoji}</div>
          <h3 className="text-3xl font-bold text-white drop-shadow-lg mb-3">Error</h3>
          <p className="text-white/90 text-lg drop-shadow font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}
