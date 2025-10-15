import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order Status</h1>
          <p className="text-fire-100 text-sm mt-1 text-center">Loading your order...</p>
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-12">
            <div className="text-7xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 font-medium text-lg">Loading your order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order Status</h1>
          <p className="text-fire-100 text-sm mt-1 text-center">Order not found</p>
        </div>
        
        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-12 px-4">
            <div className="text-8xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h3>
            <p className="text-gray-600 mb-6 text-lg font-medium">{error || 'Could not find your order'}</p>
            <button 
              className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
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
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors"
            onClick={() => navigate(`/${customerId}/menu`)}
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order Status</h1>
        <p className="text-fire-100 text-sm mt-1 text-center">Order #{order.orderNumber}</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-40 space-y-6">

          {/* Current Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-2 border-fire-200">
            <div className="text-7xl mb-4" style={{ color: getStatusColor(order.status) }}>
              {getStatusIcon(order.status)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{order.status}</h2>
            <p className="text-gray-600 mb-4 font-medium">{getStatusMessage(order.status)}</p>
            
            {/* Status Progress */}
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mb-2">
              <div className={`w-3 h-3 rounded-full ${['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`w-3 h-3 rounded-full ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`w-3 h-3 rounded-full ${['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-medium px-2">
              <span>Confirmed</span>
              <span>Preparing</span>
              <span>Ready</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fire-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{order.customer?.name || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Address:</span>
                <span className="font-bold text-gray-900">{order.customerLocation?.address || 'Address not available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Order Time:</span>
                <span className="font-bold text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fire-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Items ({order.items.length})</h3>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gradient-to-r from-fire-50 to-ember-50 rounded-xl border border-fire-200">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.itemName}</h4>
                    <p className="text-sm text-gray-600 font-medium">Quantity: {item.quantity}</p>
                    
                    {/* Modifiers */}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="mt-2 space-y-1">
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
                      <div className="mt-2 text-sm text-fire-800 bg-amber-50 p-2 rounded border-l-4 border-fire-400">
                        <span className="font-bold">Note:</span> {item.specialNotes}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="font-bold text-fire-600 text-lg">${item.totalPrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fire-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
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
              <hr className="my-2 border-fire-200" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-fire-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          {order.status === 'preparing' && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-5xl mb-2">⏰</div>
              <h3 className="font-bold text-orange-900 mb-1 text-lg">Estimated Preparation Time</h3>
              <p className="text-orange-700 font-medium">15-25 minutes</p>
            </div>
          )}

          {order.status === 'ready' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-5xl mb-2">🔔</div>
              <h3 className="font-bold text-green-900 mb-1 text-lg">Your Order is Ready!</h3>
              <p className="text-green-700 font-medium">Please proceed to pickup or wait for delivery</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
        <div className="space-y-2">
          <button 
            className="w-full bg-white text-fire-600 border-2 border-fire-500 font-bold py-3 px-6 rounded-xl hover:bg-fire-50 transition-all shadow-md"
            onClick={() => navigate(`/${customerId}/orders`)}
          >
            View Order History
          </button>
          
          <button 
            className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
            onClick={() => navigate(`/${customerId}/menu`)}
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  )
}