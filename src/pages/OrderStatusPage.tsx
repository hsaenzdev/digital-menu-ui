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
        return 'text-yellow-600 bg-yellow-100'
      case 'confirmed':
        return 'text-blue-600 bg-blue-100'
      case 'preparing':
        return 'text-orange-600 bg-orange-100'
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'delivered':
        return 'text-purple-600 bg-purple-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusRingColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ring-yellow-500'
      case 'confirmed':
        return 'ring-blue-500'
      case 'preparing':
        return 'ring-orange-500'
      case 'ready':
        return 'ring-green-500'
      case 'delivered':
        return 'ring-purple-500'
      case 'cancelled':
        return 'ring-red-500'
      default:
        return 'ring-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📋 Order Status</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 text-lg">Loading your order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📋 Order Status</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Order Not Found</h3>
            <p className="text-red-700 mb-4">{error || 'Could not find your order'}</p>
            <button 
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => navigate('/welcome')}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stepCompleted = (stepStatus: string) => {
    const orderIndex = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'].indexOf(order.status)
    const stepIndex = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'].indexOf(stepStatus)
    return stepIndex <= orderIndex
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📋 Order Status</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
        </div>

        {/* Current Status */}
        <div className={`${getStatusColor(order.status)} rounded-xl p-6 text-center ring-4 ${getStatusRingColor(order.status)}`}>
          <div className="text-6xl mb-4">
            {getStatusIcon(order.status)}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </h2>
          <p className="text-lg mb-4">
            {getStatusMessage(order.status)}
          </p>
          <p className="text-sm opacity-75">
            Order placed: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
          <div className="space-y-4">
            {[
              { status: 'pending', icon: '⏳', label: 'Order Received' },
              { status: 'confirmed', icon: '✅', label: 'Confirmed' },
              { status: 'preparing', icon: '👨‍🍳', label: 'Preparing' },
              { status: 'ready', icon: '🔔', label: 'Ready' },
              { status: 'delivered', icon: '🎉', label: 'Delivered' }
            ].map((step) => (
              <div key={step.status} className={`flex items-center space-x-3 ${stepCompleted(step.status) ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${stepCompleted(step.status) ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {stepCompleted(step.status) ? '✓' : step.icon}
                </div>
                <span className={`font-medium ${stepCompleted(step.status) ? 'text-green-800' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Order Details</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{order.customerPhone}</span>
            </div>
            {order.address && (
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-gray-900 text-right">{order.address}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-300 pt-3">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="font-bold text-green-600 text-lg">${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Items:</h4>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{item.itemName}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">x{item.quantity}</span>
                      <div className="font-bold text-gray-900">${item.totalPrice.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.selectedModifiers.map((modifier, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
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
                  
                  {item.specialNotes && (
                    <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      <span className="font-medium">📝 Special Notes:</span>
                      <span className="ml-1">{item.specialNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📞 Need Help?</h3>
          <p className="text-blue-800 mb-3">If you have any questions about your order, please contact us:</p>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>WhatsApp: You'll receive updates automatically</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🕒</span>
              <span>Estimated time: 15-25 minutes</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button 
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            onClick={() => window.location.reload()}
          >
            <span>🔄</span>
            <span>Refresh Status</span>
          </button>
          <button 
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  )
}