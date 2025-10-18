import React from 'react'
import { useErrorPageHelpers } from '../../components/validation-errors/useValidationRedirect'
import { SUPPORT_PHONE, SUPPORT_EMAIL } from './constants'

/**
 * Error page shown when customer account is disabled/suspended
 * 
 * Triggered by: validateCustomerStatus failed (canOrder = false)
 * State: 'customer_disabled'
 * 
 * Matches WelcomePage styling for consistency
 */
export const CustomerDisabledPage: React.FC = () => {
  const { handleTryAgain } = useErrorPageHelpers()

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            Account Suspended
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            Your account has been temporarily suspended. Please contact our support team for assistance.
          </p>
          
          {/* Support Info Card */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
            <p className="text-white/80 text-sm font-semibold mb-2">Need Help?</p>
            <p className="text-white/70 text-xs mb-1">📞 Call: {SUPPORT_PHONE}</p>
            <p className="text-white/70 text-xs">📧 Email: {SUPPORT_EMAIL}</p>
          </div>

          <button 
            className="w-full bg-white/20 text-white border border-white/30 font-bold text-lg py-4 px-6 rounded-xl hover:bg-white/30 transform active:scale-95 transition-all"
            onClick={handleTryAgain}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
