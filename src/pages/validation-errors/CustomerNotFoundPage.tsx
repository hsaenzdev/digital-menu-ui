import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'

/**
 * Error page shown when customer ID is not found in database
 * 
 * Triggered by: validateCustomerExists failed
 * State: 'customer_not_found'
 * 
 * Note: No "Try Again" button since there's no valid customer to return to
 */
export const CustomerNotFoundPage: React.FC = () => {
  return (
    <ErrorPageLayout
      icon="❓"
      title="Customer Not Found"
      message="We couldn't find your customer profile. This link may be invalid or expired. Please contact us to receive a new personalized link."
      primaryAction={{
        label: '� Contact Support',
        onClick: () => {
          // Could open support link, WhatsApp, etc.
          window.location.href = 'tel:5551234567'
        },
        variant: 'fire'
      }}
      showSupport={true}
      supportMessage="To receive a new order link, please contact:"
    >
      {/* Help Info */}
      <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 mb-4">
        <p className="font-semibold mb-2">📋 How to get your order link:</p>
        <ol className="space-y-1 text-left">
          <li>1. Contact us via WhatsApp or Messenger</li>
          <li>2. We'll send you a personalized link</li>
          <li>3. Use that link to start ordering</li>
        </ol>
      </div>
    </ErrorPageLayout>
  )
}
