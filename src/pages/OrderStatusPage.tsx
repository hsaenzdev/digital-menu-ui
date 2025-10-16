import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import type { Order } from '../types'

export const OrderStatusPage: React.FC = () => {
  const { orderId, customerId } = useParams<{ orderId: string; customerId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch order')
        }

        setOrder(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '🔔'
      case 'delivered':
        return '🎉'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being reviewed.'
      case 'confirmed':
        return 'Your order has been confirmed and will be prepared shortly.'
      case 'preparing':
        return 'Our kitchen is preparing your delicious order!'
      case 'ready':
        return 'Your order is ready for pickup or delivery!'
      case 'delivered':
        return 'Your order has been delivered. Enjoy your meal!'
      case 'cancelled':
        return 'Your order has been cancelled.'
      default:
        return 'Status unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffc107'
      case 'confirmed':
        return '#17a2b8'
      case 'preparing':
        return '#fd7e14'
      case 'ready':
        return '#28a745'
      case 'delivered':
        return '#6f42c1'
      case 'cancelled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Header - Consistent */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
          <h1 className="text-lg font-bold text-center drop-shadow-md">📋 Order Status</h1>
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-8">
            <div className="text-5xl mb-3 animate-pulse">⏳</div>
            <p className="text-gray-600 font-medium text-sm">Loading your order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Header - Consistent */}
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

        {/* Error Content */}
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header - Consistent */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/${customerId}`)}
            className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} className="text-base" />
          </button>
          <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">📋 Order #{order.id}</h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-3 pb-28 space-y-3">

          {/* Current Status - Compact */}
          <div className="bg-white rounded-xl shadow-md p-4 text-center border border-fire-200">
            <div className="text-5xl mb-2" style={{ color: getStatusColor(order.status) }}>
              {getStatusIcon(order.status)}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1.5 capitalize">{order.status}</h2>
            <p className="text-gray-600 mb-3 font-medium text-sm">{getStatusMessage(order.status)}</p>
            
            {/* Status Progress - Compact */}
            <div className="flex justify-center items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="w-6 h-0.5 bg-gray-300"></div>
              <div className={`w-2.5 h-2.5 rounded-full ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="w-6 h-0.5 bg-gray-300"></div>
              <div className={`w-2.5 h-2.5 rounded-full ${['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="w-6 h-0.5 bg-gray-300"></div>
              <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
              <span>Confirmed</span>
              <span>Preparing</span>
              <span>Ready</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Order Details - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">Order Details</h3>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{order.customer?.name || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Address:</span>
                <span className="font-bold text-gray-900 truncate ml-2">{order.customerLocation?.address || 'Address not available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Order Time:</span>
                <span className="font-bold text-gray-900 text-xs">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">Items ({order.items.length})</h3>
            
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-2.5 bg-gradient-to-r from-fire-50 to-ember-50 rounded-lg border border-fire-200">
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

          {/* Order Summary - Compact */}
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

          {/* Estimated Time - Compact */}
          {order.status === 'preparing' && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-400 rounded-xl p-3 text-center shadow-md">
              <div className="text-4xl mb-1.5">⏰</div>
              <h3 className="font-bold text-orange-900 mb-0.5 text-sm">Estimated Preparation Time</h3>
              <p className="text-orange-700 font-medium text-xs">15-25 minutes</p>
            </div>
          )}

          {order.status === 'ready' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-400 rounded-xl p-3 text-center shadow-md">
              <div className="text-4xl mb-1.5">🔔</div>
              <h3 className="font-bold text-green-900 mb-0.5 text-sm">Your Order is Ready!</h3>
              <p className="text-green-700 font-medium text-xs">Please proceed to pickup or wait for delivery</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Actions - Compact */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-2.5 shadow-2xl z-50">
        <button 
          className="w-full bg-white text-fire-600 border border-fire-500 font-semibold text-xs py-2 px-4 rounded-lg hover:bg-fire-50 transition-all"
          onClick={() => navigate(`/${customerId}/orders`)}
        >
          📋 View Order History
        </button>
      </div>
    </div>
  )
}