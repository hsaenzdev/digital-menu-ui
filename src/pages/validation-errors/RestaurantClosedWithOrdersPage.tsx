import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

/**
 * Error page shown when restaurant is closed BUT customer has active orders
 * 
 * Triggered by: validateRestaurantStatus failed but activeOrder exists
 * State: 'restaurant_closed_with_orders'
 * 
 * Special case: Allows customer to track their existing order
 * Matches WelcomePage styling for consistency
 */
export const RestaurantClosedWithOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams<{ customerId: string }>()
  
  // Get active order from location state (if passed by useValidationRedirect)
  const state = location.state as any
  const activeOrder = state?.activeOrder

  const handleTryAgain = () => {
    if (customerId) {
      navigate(`/${customerId}`)
    }
  }

  const handleTrackOrder = () => {
    if (customerId && activeOrder?.id) {
      navigate(`/${customerId}/order-status/${activeOrder.id}`)
    }
  }

  const handleViewHistory = () => {
    if (customerId) {
      navigate(`/${customerId}/orders`)
    }
  }

  // Fetch restaurant status directly (matches WelcomePage ln 131-139)
  const [restaurantStatus, setRestaurantStatus] = useState<{
    isOpen: boolean
    message: string
    nextOpening?: { day: string; time: string; hoursUntil: number; minutesUntil: number } | null
  } | null>(null)

  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const response = await fetch('/api/business/status')
        const data = await response.json()
        if (data.success && data.data) {
          setRestaurantStatus(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch restaurant status:', error)
      }
    }
    fetchRestaurantStatus()
  }, [])

  // Extract directly from restaurantStatus (matches WelcomePage ln 412)
  const nextOpening = restaurantStatus?.nextOpening

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">🕐</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            We're Currently Closed
          </h2>
          
          {/* Active Order Notice */}
          {activeOrder && (
            <div className="bg-green-500/20 backdrop-blur border-2 border-green-300/50 rounded-xl p-4 mb-4">
              <div className="text-5xl mb-2">✅</div>
              <p className="text-white font-bold text-lg mb-2">
                Don't Worry!
              </p>
              <p className="text-white/90 text-sm">
                We're closed for new orders, but we're still preparing and will deliver your active order #{activeOrder.orderNumber || activeOrder.id?.slice(-6) || 'N/A'}!
              </p>
            </div>
          )}
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            You can't place new orders right now, but you can check your order status below.
          </p>
          
          {/* Next Opening Card - Matches WelcomePage ln 441-453 exactly */}
          {nextOpening && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-white/80 text-sm font-semibold mb-2">Next Opening:</p>
              <p className="text-white text-xl font-bold mb-1">
                {nextOpening.day} at {nextOpening.time}
              </p>
              <p className="text-white/70 text-xs">
                {nextOpening.hoursUntil > 0 
                  ? `In ${nextOpening.hoursUntil}h ${nextOpening.minutesUntil}m`
                  : `In ${nextOpening.minutesUntil} minutes`
                }
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Order Status Button - Primary */}
            {activeOrder && (
              <button 
                className="w-full bg-green-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-green-600 transform active:scale-95 transition-all"
                onClick={handleTrackOrder}
              >
                📦 Track My Order #{activeOrder.orderNumber || activeOrder.id?.slice(-6) || ''}
              </button>
            )}
            
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
              <p className="text-white/60 text-xs">Call us: (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
