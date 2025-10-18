import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

/**
 * Error page shown when customer location is outside delivery zone
 * 
 * Triggered by: validateGeofencingValidate failed (outside zone)
 * State: 'outside_zone'
 * 
 * Matches WelcomePage styling for consistency
 */
export const OutsideZonePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams<{ customerId: string }>()

  // Get geofencing data from location state (if passed by useValidationRedirect)
  const state = location.state as any
  const geofencingData = state?.geofencing

  const handleTryAgain = () => {
    if (customerId) {
      navigate(`/${customerId}`)
    }
  }

  const cityName = geofencingData?.city?.name
  const message = geofencingData?.message || "Unfortunately, your location is outside our current delivery zones."

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">😔</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            We Can't Deliver to Your Area Yet
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            {message}
          </p>
          
          {/* Location Card */}
          {cityName && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-white/80 text-sm">
                <span className="font-semibold">Detected City:</span> {cityName}
              </p>
              <p className="text-white/70 text-xs mt-1">
                We're working on expanding our delivery areas!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button 
              className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
              onClick={handleTryAgain}
            >
              🔄 Try Again
            </button>
            
            <div className="text-white/80 text-sm mt-4">
              <p className="mb-2">📞 Want to know when we're in your area?</p>
              <p className="text-white/60 text-xs">Contact us: (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
