import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when customer location is outside city boundaries
 * 
 * Triggered by: validateGeofencingValidate failed (outside city)
 * State: 'outside_city'
 */
export const OutsideCityPage: React.FC = () => {
  const { handleTryAgain, geofencingData } = useErrorPageHelpers()

  const cityName = geofencingData?.city?.name || 'our service area'

  return (
    <ErrorPageLayout
      icon="📍"
      title="Outside Service Area"
      message={`We currently only serve customers in ${cityName}. We're working on expanding to new areas!`}
      primaryAction={{
        label: '🔄 Try Again',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      showSupport={true}
      supportMessage="Want us to deliver to your area? Let us know:"
    >
      {/* Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-blue-800">
          📌 Current Service Area
        </p>
        <p className="text-lg font-bold text-blue-900 mt-1">
          {cityName}
        </p>
      </div>

      {/* Expansion Note */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <p className="font-semibold mb-1">🚀 We're Growing!</p>
        <p>
          We're constantly expanding our delivery areas. 
          Contact us to request service in your neighborhood.
        </p>
      </div>
    </ErrorPageLayout>
  )
}
