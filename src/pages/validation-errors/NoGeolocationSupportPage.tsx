import React from 'react'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'
import { SUPPORT_PHONE } from './constants'

/**
 * Error page shown when browser doesn't support geolocation
 * 
 * Triggered by: validateGeoLocationSupport failed
 * State: 'no_geolocation_support'
 * 
 * Note: WelcomePage treats this the same as no_location
 * Keeping separate for better error clarity
 * Matches WelcomePage styling for consistency
 */
export const NoGeolocationSupportPage: React.FC = () => {
  const { handleTryAgain } = useErrorPageHelpers()

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">🌐</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            Location Not Supported
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            Your browser doesn't support location services. We need this to verify delivery availability.
          </p>
          
          {/* Recommendations Card */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 text-left">
            <p className="text-white/80 text-sm font-semibold mb-2">
              💡 Try these solutions:
            </p>
            <ul className="text-white/70 text-xs space-y-1">
              <li>• Update your browser to the latest version</li>
              <li>• Try Chrome, Firefox, Safari, or Edge</li>
              <li>• Enable location services in device settings</li>
            </ul>
          </div>

          <button 
            className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
            onClick={handleTryAgain}
          >
            🔄 Try Again
          </button>
          
          <div className="text-white/80 text-sm mt-4">
            <p className="mb-2">📞 Need help?</p>
            <p className="text-white/60 text-xs">Call: {SUPPORT_PHONE}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
