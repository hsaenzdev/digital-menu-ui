import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order } from '../../types'

interface WelcomeFormProps {
  customerId: string
  name: string
  address: string
  locationLoading: boolean
  locationError: string
  formError: string
  saving: boolean
  hasGPS: boolean
  activeOrder: Order | null
  onNameChange: (name: string) => void
  onAddressChange: (address: string) => void
  onSubmit: (e: React.FormEvent) => void
}

/**
 * Welcome form component for collecting customer name and address
 * Separated for clarity and reusability
 */
export const WelcomeForm: React.FC<WelcomeFormProps> = ({
  customerId,
  name,
  address,
  locationLoading,
  locationError,
  formError,
  saving,
  hasGPS,
  activeOrder,
  onNameChange,
  onAddressChange,
  onSubmit
}) => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold text-center drop-shadow-md">🏠 Welcome</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-orange-50 to-white p-3 overflow-y-auto">
        <form onSubmit={onSubmit} className="flex-1 flex flex-col space-y-2.5">
          {/* Name Input */}
          <div className="bg-white rounded-lg shadow-sm p-2.5 border border-fire-200">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">👤</span>
              <label htmlFor="name" className="font-semibold text-gray-800 text-xs">
                Your Name
              </label>
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full px-2.5 py-1.5 border border-fire-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium text-sm"
            />
          </div>

          {/* Address Input */}
          <div className="bg-white rounded-lg shadow-sm p-2.5 border border-fire-200 flex-1 flex flex-col min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">📍</span>
                <label className="font-semibold text-gray-800 text-xs">
                  Delivery Address
                </label>
              </div>
              {hasGPS && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">GPS ✓</span>
              )}
            </div>

            {locationLoading && (
              <div className="flex items-center justify-center gap-2 mb-1.5 py-1">
                <div className="w-3 h-3 border-2 border-fire-200 border-t-fire-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-xs font-medium">Getting location...</p>
              </div>
            )}

            <textarea
              className="w-full px-2.5 py-1.5 border border-fire-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium resize-none text-sm flex-1"
              placeholder="123 Main St, Apt 4B"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              disabled={locationLoading}
              required
            />

            {locationError && (
              <div className="mt-1 bg-amber-50 border border-amber-300 rounded p-1">
                <p className="text-amber-700 font-medium text-xs">💡 {locationError}</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {formError && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-2 flex items-center gap-2">
              <span className="text-sm">❌</span>
              <span className="text-red-700 font-semibold text-xs">{formError}</span>
            </div>
          )}

          {/* View Order History Button */}
          <button
            type="button"
            onClick={() => navigate(`/${customerId}/orders`)}
            className="w-full bg-white/80 backdrop-blur text-fire-600 border border-fire-300 font-semibold py-2 px-3 rounded-lg hover:bg-white hover:border-fire-400 transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <span className="text-sm">📋</span>
            <span>View Order History</span>
          </button>

          {/* Active Order Alert */}
          {activeOrder && (
            <div className="bg-gradient-to-r from-fire-50 to-amber-50 border-2 border-fire-400 rounded-lg p-2.5 shadow-md">
              <div className="flex items-start gap-2">
                <span className="text-xl">🔥</span>
                <div className="flex-1">
                  <h4 className="font-bold text-fire-800 text-xs mb-0.5">
                    Active Order in Progress
                  </h4>
                  <p className="text-fire-700 text-xs mb-1.5">
                    Order #{activeOrder.orderNumber} • {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/${customerId}/order-status/${activeOrder.id}`)}
                    className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-xs py-1.5 px-2.5 rounded-md hover:from-fire-600 hover:to-ember-600 transition-all shadow-md"
                  >
                    📋 View Order Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Button */}
      <div className="flex-shrink-0 bg-white border-t-2 border-fire-400 p-3 shadow-2xl">
        <button 
          type="submit"
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-base py-3 px-4 rounded-lg shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={saving || !name.trim() || !address.trim() || locationLoading || !!activeOrder}
        >
          {saving ? '⏳ Saving...' : 
           activeOrder ? '🔒 Complete Active Order First' :
           !name.trim() ? '👆 Enter Your Name' :
           !address.trim() ? '👆 Enter Address' :
           '🔥 Continue to Menu'}
        </button>
        
        {activeOrder && (
          <p className="text-xs text-center text-amber-700 font-semibold mt-1.5">
            Complete or cancel your active order first
          </p>
        )}
        
        {(!name.trim() || !address.trim()) && !saving && !activeOrder && (
          <p className="text-xs text-center text-gray-500 mt-1.5">
            Complete all fields to continue
          </p>
        )}
      </div>
    </div>
  )
}
