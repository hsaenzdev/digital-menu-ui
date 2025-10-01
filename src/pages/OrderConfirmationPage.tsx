import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCustomer } from '../context/CustomerContext'
import type { Order } from '../types'

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { customer, location } = useCustomer()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Give time for contexts to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Check if we have required data
  const hasCartItems = cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0
  const hasCustomerInfo = customer?.id && customer?.phoneNumber && customer?.name

  const calculateTotal = () => {
    if (!hasCartItems) return 0
    return cart.items.reduce((total, item) => total + (item.totalPrice * item.quantity), 0)
  }

  const submitOrder = async () => {
    if (!hasCartItems || !hasCustomerInfo) {
      setError('Missing required information')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const subtotal = calculateTotal()
      const tax = 0 // No tax for now
      const tip = 0 // No tip for now
      const total = subtotal + tax + tip

      const orderData = {
        customerPhone: customer.phoneNumber,
        customerName: customer.name,
        location: location?.address || '',
        address: location?.address || '',
        subtotal: subtotal,
        tax: tax,
        tip: tip,
        total: total,
        items: cart.items
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit order')
      }

      setSubmittedOrder(result.data)
      clearCart()
      
      // Navigate to order status after 3 seconds
      setTimeout(() => {
        navigate(`/order-status/${result.data.id}`)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📋 Loading Order</h1>
            <p className="text-gray-600">Preparing your order confirmation...</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 text-lg">Loading your order details...</p>
          </div>
        </div>
      </div>
    )
  }

  // If missing data, show appropriate message
  if (!hasCartItems || !hasCustomerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">⚠️ Missing Information</h1>
            <p className="text-gray-600">Please complete the required steps</p>
          </div>
          
          <div className="space-y-4">
            {!hasCartItems && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">🛒 Empty Cart</h3>
                <p className="text-red-700 mb-4">You need to add items to your cart before proceeding to checkout.</p>
                <button 
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  onClick={() => navigate('/menu')}
                >
                  Browse Menu
                </button>
              </div>
            )}
            
            {!hasCustomerInfo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">👤 Customer Information Required</h3>
                <p className="text-orange-700 mb-4">Please provide your contact information to continue.</p>
                <button 
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  onClick={() => navigate('/customer-info')}
                >
                  Enter Information
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If order has been submitted, show confirmation
  if (submittedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-xl text-green-600 font-semibold">Order #{submittedOrder.orderNumber}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Thank you for your order!</h3>
            <p className="text-green-800">Your order has been successfully submitted and we've sent you a WhatsApp confirmation.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Order Details:</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">{submittedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{submittedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="font-bold text-green-600 text-lg">${submittedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-800">
              <span>📱</span>
              <span className="text-sm">You'll receive WhatsApp updates about your order status</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Redirecting to order status page...</p>
            <button 
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              onClick={() => navigate(`/order-status/${submittedOrder.id}`)}
            >
              View Order Status
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors" 
            onClick={() => navigate('/cart')}
          >
            ← Back to Cart
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📋 Confirm Order</h1>
          <p className="text-gray-600">Review your order before submitting</p>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">👤 Customer Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{customer.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">🍽️ Order Items</h3>
          <div className="space-y-4">
            {cart.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">{item.itemName}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                    <div className="font-bold text-gray-900">${(item.totalPrice * item.quantity).toFixed(2)}</div>
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
                    <span className="font-medium">📝 Notes:</span>
                    <span className="ml-1">{item.specialNotes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-700">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button 
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          onClick={submitOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Submitting Order...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Submit Order</span>
            </>
          )}
        </button>

        {/* Additional Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>You'll receive WhatsApp updates about your order</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🕒</span>
              <span>Estimated preparation time: 15-25 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Your payment will be collected upon delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}