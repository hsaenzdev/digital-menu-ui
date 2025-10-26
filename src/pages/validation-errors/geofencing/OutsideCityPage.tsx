import React from 'react'
import { useErrorPageHelpers } from '../../../components/validation-errors/useValidationRedirect'
import { EXPANSION_EMAIL } from '../constants'

/**
 * Error page shown when customer location is outside city boundaries
 * 
 * Triggered by: validateGeofencingValidate failed (outside city)
 * State: 'outside_city'
 * 
 * Matches WelcomePage styling for consistency
 */
export const OutsideCityPage: React.FC = () => {
  const { handleTryAgain, geofencingData } = useErrorPageHelpers()

  const cityName = geofencingData?.city?.name
  const message = geofencingData?.message || "We don't currently operate in your city."

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">🌍</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            We're Not in Your City Yet
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            {message}
          </p>
          
          {/* City Detection Card */}
          {cityName && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-white/80 text-sm">
                <span className="font-semibold">Your Location:</span> {cityName}
              </p>
              <p className="text-white/70 text-xs mt-1">
                We're working hard to expand to your area!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button 
              className="w-full bg-white text-orange-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-orange-50 transform active:scale-95 transition-all"
              onClick={handleTryAgain}
            >
              🔄 Try Again
            </button>
            
            <div className="text-white/80 text-sm mt-4">
              <p className="mb-2">📧 Want us in your city?</p>
              <p className="text-white/60 text-xs">Email: {EXPANSION_EMAIL}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
