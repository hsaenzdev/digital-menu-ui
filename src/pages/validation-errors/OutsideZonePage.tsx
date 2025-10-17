import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when customer location is outside delivery zone
 * 
 * Triggered by: validateGeofencingValidate failed (outside zone)
 * State: 'outside_zone'
 */
export const OutsideZonePage: React.FC = () => {
  const { handleTryAgain, geofencingData } = useErrorPageHelpers()

  const cityName = geofencingData?.city?.name || 'the city'
  const zoneName = geofencingData?.zone?.name

  return (
    <ErrorPageLayout
      icon="🗺️"
      title="Outside Delivery Zone"
      message={`You're in ${cityName}, but outside our current delivery zones. We're working on expanding coverage!`}
      primaryAction={{
        label: '🔄 Try Different Location',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      showSupport={true}
      supportMessage="Want delivery to your area? Contact us:"
    >
      {/* Location Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-yellow-800">
          📍 Your Location
        </p>
        <p className="text-lg font-bold text-yellow-900 mt-1">
          {cityName}
        </p>
        {zoneName && (
          <p className="text-sm text-yellow-700 mt-1">
            Nearest zone: {zoneName}
          </p>
        )}
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <p className="font-semibold mb-1">💡 Tip</p>
        <p>
          If you've moved to a different location, try clicking "Try Different Location" 
          to update your GPS coordinates.
        </p>
      </div>
    </ErrorPageLayout>
  )
}
