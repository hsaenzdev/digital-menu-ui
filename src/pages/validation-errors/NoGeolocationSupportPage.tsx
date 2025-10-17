import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when browser doesn't support geolocation
 * 
 * Triggered by: validateGeoLocationSupport failed
 * State: 'no_geolocation_support'
 */
export const NoGeolocationSupportPage: React.FC = () => {
  const { handleTryAgain } = useErrorPageHelpers()

  return (
    <ErrorPageLayout
      icon="🌐"
      title="Location Not Supported"
      message="Your browser doesn't support location services, which we need to verify delivery availability."
      primaryAction={{
        label: '🔄 Try Again',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      showSupport={true}
      supportMessage="Need help? Contact us:"
    >
      {/* Recommendations */}
      <div className="text-left bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        <p className="font-semibold text-orange-900 mb-3">
          💡 Recommended Solutions:
        </p>
        <ul className="space-y-2 text-sm text-orange-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Update your browser to the latest version</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Try a modern browser (Chrome, Firefox, Safari, Edge)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Enable location services in your device settings</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Contact support with your browser and device info</span>
          </li>
        </ul>
      </div>
    </ErrorPageLayout>
  )
}
