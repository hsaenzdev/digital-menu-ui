import React from 'react'
import { ErrorPageLayout } from '../../components/validation-errors/ErrorPageLayout'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'

/**
 * Error page shown when customer account is disabled/suspended
 * 
 * Triggered by: validateCustomerStatus failed (canOrder = false)
 * State: 'customer_disabled'
 */
export const CustomerDisabledPage: React.FC = () => {
  const { handleTryAgain } = useErrorPageHelpers()

  return (
    <ErrorPageLayout
      icon="🚫"
      title="Account Suspended"
      message="Your account has been temporarily suspended. Please contact support to resolve this issue."
      primaryAction={{
        label: '🔄 Try Again',
        onClick: handleTryAgain,
        variant: 'fire'
      }}
      showSupport={true}
      supportMessage="To reactivate your account, please contact:"
    />
  )
}
