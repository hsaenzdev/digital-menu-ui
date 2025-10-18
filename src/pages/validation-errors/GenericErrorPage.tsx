import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

/**
 * Generic error page for unexpected validation failures
 * 
 * Triggered by: Any validation that returns 'error' state
 * State: 'error'
 * 
 * Matches WelcomePage styling for consistency
 */
export const GenericErrorPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()

  const handleTryAgain = () => {
    if (customerId) {
      navigate(`/${customerId}`)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            Something Went Wrong
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            We couldn't verify your delivery zone. Please try again.
          </p>

          <button 
            className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
            onClick={handleTryAgain}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
