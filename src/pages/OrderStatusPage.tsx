import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Order } from '../types'

export const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
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
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Order Status</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">Loading your order...</p>
          </div>
          
          {/* Loading Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-600">Loading your order details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Order Status</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">Order not found</p>
          </div>
          
          {/* Error Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-6">{error || 'Could not find your order'}</p>
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-card hover:shadow-card-hover"
                onClick={() => navigate('/welcome')}
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button 
              className="text-white hover:text-purple-100 font-medium flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/menu')}
            >
              ← <span className="hidden xs:inline">Back</span>
            </button>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">📋 Order Status</h1>
              <p className="text-purple-100 text-xs sm:text-sm md:text-base">Order #{order.orderNumber}</p>
            </div>
            <div className="w-8"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="p-4 sm:p-6 pb-24 space-y-6"> {/* Bottom padding for sticky button */}

            {/* Current Status */}
            <div className="bg-white rounded-2xl shadow-card p-6 text-center border border-gray-100">
              <div className="text-6xl mb-4" style={{ color: getStatusColor(order.status) }}>
                {getStatusIcon(order.status)}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{order.status}</h2>
              <p className="text-gray-600 mb-4">{getStatusMessage(order.status)}</p>
              
              {/* Status Progress */}
              <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
                <div className={`w-3 h-3 rounded-full ${['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`w-3 h-3 rounded-full ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`w-3 h-3 rounded-full ${['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Confirmed</span>
                <span>Preparing</span>
                <span>Ready</span>
                <span>Delivered</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{order.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-gray-900">{order.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Time:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Items ({order.items.length})</h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      
                      {/* Modifiers */}
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.selectedModifiers.map((modifier, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              <span className="font-medium">{modifier.modifierName}:</span>
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
                        <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                          <span className="font-medium">Note:</span> {item.specialNotes}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="font-bold text-purple-600">${item.totalPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="text-gray-900">${order.tip.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-purple-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            {order.status === 'preparing' && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">⏰</div>
                <h3 className="font-bold text-orange-900 mb-1">Estimated Preparation Time</h3>
                <p className="text-orange-700">15-25 minutes</p>
              </div>
            )}

            {order.status === 'ready' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <h3 className="font-bold text-green-900 mb-1">Your Order is Ready!</h3>
                <p className="text-green-700">Please proceed to pickup or wait for delivery</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 rounded-b-3xl">
          <div className="space-y-2">
            <button 
              className="w-full bg-white text-purple-600 border-2 border-purple-600 font-medium py-2.5 px-6 rounded-xl hover:bg-purple-50 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/order-history')}
            >
              View Order History
            </button>
            
            <button 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/menu')}
            >
              Order Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}