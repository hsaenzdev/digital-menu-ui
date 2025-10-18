import React from 'react'
import { SUPPORT_PHONE, SUPPORT_EMAIL } from './constants'

/**
 * Error page shown when customer ID is not found in database
 * 
 * Triggered by: validateCustomerExists failed
 * State: 'customer_not_found'
 * 
 * Note: No "Try Again" button since there's no valid customer to return to
 * Matches WelcomePage styling for consistency
 */
export const CustomerNotFoundPage: React.FC = () => {
  const handleContactSupport = () => {
    // Could open support link, WhatsApp, etc.
    window.location.href = `tel:${SUPPORT_PHONE.replace(/[^0-9]/g, '')}`
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">❓</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            Customer Not Found
          </h2>
          
          <p className="text-white/90 text-lg mb-6 drop-shadow">
            We couldn't find your customer profile. This link may be invalid or expired.
          </p>
          
          {/* Help Info Card */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 text-left">
            <p className="text-white/80 text-sm font-semibold mb-2">
              📋 How to get your order link:
            </p>
            <ol className="text-white/70 text-xs space-y-1">
              <li>1. Contact us via WhatsApp or Messenger</li>
              <li>2. We'll send you a personalized link</li>
              <li>3. Use that link to start ordering</li>
            </ol>
          </div>

          <button 
            className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
            onClick={handleContactSupport}
          >
            📞 Contact Support
          </button>
          
          <div className="text-white/80 text-sm mt-4">
            <p className="mb-2">Need help?</p>
            <p className="text-white/60 text-xs">📞 {SUPPORT_PHONE}</p>
            <p className="text-white/60 text-xs">📧 {SUPPORT_EMAIL}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
