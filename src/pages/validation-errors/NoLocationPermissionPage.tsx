import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

/**
 * Error page shown when user denies location permission
 * 
 * Triggered by: validateGeoLocationGather failed (permission denied)
 * State: 'no_location_permission'
 * 
 * Matches WelcomePage styling for consistency
 */
export const NoLocationPermissionPage: React.FC = () => {
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
          <div className="text-8xl mb-6">📍</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            Location Access Needed
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            We need your location to check if we can deliver to your area.
          </p>
          
          {/* Instructions Card */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 text-left">
            <p className="text-white/80 text-sm font-semibold mb-2">
              How to enable location:
            </p>
            <ol className="text-white/70 text-xs space-y-1">
              <li>1. Click the 🔒 icon in your browser's address bar</li>
              <li>2. Allow location access for this site</li>
              <li>3. Refresh the page</li>
            </ol>
          </div>

          <button 
            className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
            onClick={handleTryAgain}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    </div>
  )
}
