import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when user denies location permission
 * 
 * Triggered by: validateGeoLocationGather failed (permission denied)
 * State: 'no_location_permission'
 */
export const NoLocationPermissionPage: React.FC = () => {
  const { handleTryAgain } = useErrorPageHelpers()

  return (
    <ErrorPageLayout
      icon="📍"
      title="Location Access Needed"
      message="We need your location to verify we can deliver to your area and calculate delivery fees accurately."
      primaryAction={{
        label: '🔄 Enable & Retry',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      showSupport={false}
    >
      {/* Instructions */}
      <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="font-semibold text-blue-900 mb-3">
          📋 How to Enable Location Access:
        </p>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>Click the 🔒 lock icon in your browser's address bar</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>Find "Location" in the permissions list</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>Change it to "Allow"</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>Click "Enable & Retry" button above</span>
          </li>
        </ol>
      </div>

      {/* Privacy Note */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p className="font-semibold mb-1">🔒 Privacy Notice</p>
        <p>
          We only use your location to validate delivery zones. 
          Your location is not stored or shared.
        </p>
      </div>
    </ErrorPageLayout>
  )
}
