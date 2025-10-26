import React from 'react'
import { useErrorPageHelpers } from '../../../components/validation-errors/useValidationRedirect'
import { useRestaurantStatus } from './useRestaurantStatus'
import { getStatusEmoji, formatTimeUntilOpening, getStatusTitle } from './restaurantStatusUtils'
import { SUPPORT_PHONE } from '../constants'

/**
 * Error page shown when restaurant is closed (no active orders)
 * 
 * Triggered by: validateRestaurantStatus failed (isOpen = false)
 * State: 'restaurant_closed'
 * 
 * Matches WelcomePage styling for consistency
 */
export const RestaurantClosedPage: React.FC = () => {
  const { handleTryAgain, handleViewHistory } = useErrorPageHelpers()
  const restaurantStatus = useRestaurantStatus()

  // Use API data with fallbacks
  const currentStatus = restaurantStatus?.currentStatus || 'closed'
  const emoji = getStatusEmoji(currentStatus)
  const title = getStatusTitle(currentStatus)
  const message = restaurantStatus?.message || "We're not accepting orders right now."
  const nextOpening = restaurantStatus?.nextOpening || null
  const timeUntilOpening = formatTimeUntilOpening(nextOpening)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">{emoji}</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            {title}
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            {message}
          </p>
          
          {/* Next Opening Card */}
          {nextOpening && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-white/80 text-sm font-semibold mb-2">Next Opening:</p>
              <p className="text-white text-xl font-bold mb-1">
                {nextOpening.day} at {nextOpening.time}
              </p>
              {timeUntilOpening && (
                <p className="text-white/70 text-xs">
                  {timeUntilOpening}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Order History Button */}
            <button 
              className="w-full bg-white/20 backdrop-blur text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-white/30 border-2 border-white/40 transform active:scale-95 transition-all"
              onClick={handleViewHistory}
            >
              📜 View Order History
            </button>
            
            {/* Check Again Button */}
            <button 
              className="w-full bg-white text-indigo-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-indigo-50 transform active:scale-95 transition-all"
              onClick={handleTryAgain}
            >
              🔄 Check Again
            </button>
            
            <div className="text-white/80 text-sm mt-4">
              <p className="mb-2">📞 Questions?</p>
              <p className="text-white/60 text-xs">Call us: {SUPPORT_PHONE}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
