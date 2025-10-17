import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when restaurant is closed (no active orders)
 * 
 * Triggered by: validateRestaurantStatus failed (isOpen = false)
 * State: 'restaurant_closed'
 */
export const RestaurantClosedPage: React.FC = () => {
  const { handleTryAgain, handleViewHistory, restaurantStatus } = useErrorPageHelpers()

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
      message={restaurantStatus?.message || "We're not accepting orders right now."}
      primaryAction={{
        label: '🔄 Check Again',
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
