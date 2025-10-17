import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Generic error page for unexpected validation failures
 * 
 * Triggered by: Any validation that returns 'error' state
 * State: 'error'
 */
export const GenericErrorPage: React.FC = () => {
  const { handleTryAgain, validationState } = useErrorPageHelpers()

  return (
    <ErrorPageLayout
      icon="⚠️"
      title="Something Went Wrong"
      message="We encountered an unexpected error while verifying your access. Please try again."
      primaryAction={{
        label: '🔄 Try Again',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      showSupport={true}
      supportMessage="If this problem persists, please contact:"
    >
      {/* Error Details (for debugging) */}
      {validationState && validationState !== 'error' && (
        <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 mb-4 font-mono">
          Error Code: {validationState}
        </div>
      )}

      {/* Suggestions */}
      <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
        <p className="font-semibold mb-2">💡 Try these steps:</p>
        <ul className="space-y-1 text-left">
          <li>• Check your internet connection</li>
          <li>• Refresh the page</li>
          <li>• Clear browser cache and cookies</li>
          <li>• Try a different browser</li>
        </ul>
      </div>
    </ErrorPageLayout>
  )
}
