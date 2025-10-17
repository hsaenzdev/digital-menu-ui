import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when restaurant is closed BUT customer has active orders
 * 
 * Triggered by: validateRestaurantStatus failed but activeOrder exists
 * State: 'restaurant_closed' or 'restaurant_closed_active_orders'
 * 
 * Special case: Allows customer to track their existing order
 */
export const RestaurantClosedWithOrdersPage: React.FC = () => {
  const { 
    handleTryAgain, 
    handleTrackOrder, 
    handleViewHistory,
    restaurantStatus,
    activeOrder 
  } = useErrorPageHelpers()

  // Format next opening time
  const nextOpening = restaurantStatus?.nextOpening
  const nextOpeningText = nextOpening
    ? `${nextOpening.day} at ${nextOpening.time}`
    : 'Check back later'
  
  // Calculate time until opening
  const timeUntilOpening = nextOpening
    ? nextOpening.hoursUntil > 0
      ? `In ${nextOpening.hoursUntil}h ${nextOpening.minutesUntil}m`
      : `In ${nextOpening.minutesUntil} minutes`
    : null

  return (
    <ErrorPageLayout
      icon="🕐"
      title="We're Currently Closed"
      message={restaurantStatus?.message || "We're not accepting new orders right now, but you can track your existing order."}
      primaryAction={{
        label: '� Check Again',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      secondaryActions={[
        {
          label: '📜 View Order History',
          onClick: handleViewHistory
        }
      ]}
      showSupport={false}
    >
      {/* Active Order Notice */}
      {activeOrder && (
        <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-300/50 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 mb-1">
                You have an active order
              </p>
              <p className="text-xs text-green-800 mb-3">
                Order #{activeOrder.id?.slice(-6) || 'N/A'}
              </p>
              <button
                onClick={handleTrackOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md"
              >
                🔍 Track Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Opening Info */}
      {nextOpening && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            📅 Next Opening
          </p>
          <p className="text-xl font-bold text-orange-900">
            {nextOpeningText}
          </p>
          {timeUntilOpening && (
            <p className="text-sm text-orange-700 mt-1">
              {timeUntilOpening}
            </p>
          )}
        </div>
      )}

      {/* Contact Info */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <p className="font-semibold mb-1">📞 Questions?</p>
        <p className="text-xs text-gray-500">Call us: (555) 123-4567</p>
      </div>
    </ErrorPageLayout>
  )
}
