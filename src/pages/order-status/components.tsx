import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import type { Order } from '../../types'
import { getStatusIcon, getStatusMessage, getStatusColor, isStatusActive } from './statusUtils'

// ============================================================================
// LOADING STATE
// ============================================================================

export const LoadingState: React.FC = () => {
  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold text-center drop-shadow-md">📋 Order Status</h1>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center py-8">
          <div className="text-5xl mb-3 animate-pulse">⏳</div>
          <p className="text-gray-600 font-medium text-sm">Loading your order details...</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface ErrorStateProps {
  error: string
  customerId: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, customerId }) => {
  const navigate = useNavigate()

  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/${customerId}`)}
            className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} className="text-base" />
          </button>
          <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">📋 Order Status</h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center py-8 px-3">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-4 text-sm font-medium">{error || 'Could not find your order'}</p>
          <button
            className="bg-gradient-to-r from-fire-600 to-ember-600 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:from-fire-700 hover:to-ember-700 transition-all shadow-lg"
            onClick={() => navigate(`/${customerId}`)}
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STATUS CARD
// ============================================================================

interface StatusCardProps {
  status: string
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center border border-fire-200">
      <div className="text-5xl mb-2" style={{ color: getStatusColor(status) }}>
        {getStatusIcon(status)}
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1.5 capitalize">{status}</h2>
      <p className="text-gray-600 mb-3 font-medium text-sm">{getStatusMessage(status)}</p>

      {/* Status Progress */}
      <div className="flex justify-center items-center gap-1.5 text-xs text-gray-500 mb-1.5">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isStatusActive(status, ['confirmed', 'preparing', 'ready', 'delivered'])
              ? 'bg-green-500'
              : 'bg-gray-300'
          }`}
        ></div>
        <div className="w-6 h-0.5 bg-gray-300"></div>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isStatusActive(status, ['preparing', 'ready', 'delivered']) ? 'bg-green-500' : 'bg-gray-300'
          }`}
        ></div>
        <div className="w-6 h-0.5 bg-gray-300"></div>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isStatusActive(status, ['ready', 'delivered']) ? 'bg-green-500' : 'bg-gray-300'
          }`}
        ></div>
        <div className="w-6 h-0.5 bg-gray-300"></div>
        <div
          className={`w-2.5 h-2.5 rounded-full ${status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
        <span>Confirmed</span>
        <span>Preparing</span>
        <span>Ready</span>
        <span>Delivered</span>
      </div>
    </div>
  )
}

// ============================================================================
// ORDER DETAILS CARD
// ============================================================================

interface OrderDetailsCardProps {
  order: Order
}

export const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ order }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
      <h3 className="font-bold text-gray-900 mb-2 text-sm">Order Details</h3>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Customer:</span>
          <span className="font-bold text-gray-900">{order.customer?.name || 'Guest'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Address:</span>
          <span className="font-bold text-gray-900 truncate ml-2">
            {order.customerLocation?.address || 'Address not available'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Order Time:</span>
          <span className="font-bold text-gray-900 text-xs">{new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ORDER ITEMS CARD
// ============================================================================

interface OrderItemsCardProps {
  items: Order['items']
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
      <h3 className="font-bold text-gray-900 mb-2 text-sm">Items ({items.length})</h3>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-start p-2.5 bg-gradient-to-r from-fire-50 to-ember-50 rounded-lg border border-fire-200"
          >
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">{item.itemName}</h4>
              <p className="text-xs text-gray-600 font-medium">Quantity: {item.quantity}</p>

              {/* Modifiers */}
              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {item.selectedModifiers.map((modifier, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      <span className="font-bold">{modifier.modifierName}:</span>
                      {modifier.selectedOptions.map((option, optIdx) => (
                        <span key={optIdx} className="ml-1">
                          {option.optionName} (+${option.price.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Special Notes */}
              {item.specialNotes && (
                <div className="mt-1.5 text-xs text-fire-800 bg-amber-50 p-1.5 rounded border-l-2 border-fire-400">
                  <span className="font-bold">Note:</span> {item.specialNotes}
                </div>
              )}
            </div>

            <div className="text-right ml-3">
              <div className="font-bold text-fire-600 text-sm">${item.totalPrice.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ORDER SUMMARY CARD
// ============================================================================

interface OrderSummaryCardProps {
  order: Order
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
      <h3 className="font-bold text-gray-900 mb-2 text-sm">Order Summary</h3>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Subtotal:</span>
          <span className="text-gray-900 font-bold">${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tax:</span>
          <span className="text-gray-900 font-bold">${order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tip:</span>
          <span className="text-gray-900 font-bold">${order.tip.toFixed(2)}</span>
        </div>
        <hr className="my-1.5 border-fire-200" />
        <div className="flex justify-between text-base font-bold pt-1">
          <span className="text-gray-900">Total:</span>
          <span className="text-fire-600">${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STATUS NOTICE CARDS
// ============================================================================

export const PreparingNotice: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-400 rounded-xl p-3 text-center shadow-md">
      <div className="text-4xl mb-1.5">⏰</div>
      <h3 className="font-bold text-orange-900 mb-0.5 text-sm">Estimated Preparation Time</h3>
      <p className="text-orange-700 font-medium text-xs">15-25 minutes</p>
    </div>
  )
}

export const ReadyNotice: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-400 rounded-xl p-3 text-center shadow-md">
      <div className="text-4xl mb-1.5">🔔</div>
      <h3 className="font-bold text-green-900 mb-0.5 text-sm">Your Order is Ready!</h3>
      <p className="text-green-700 font-medium text-xs">Please proceed to pickup or wait for delivery</p>
    </div>
  )
}
