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
    return cart.subtotal + cart.tax + cart.tip
  }

  const handleSubmitOrder = async () => {
    if (!hasCartItems || !hasCustomerInfo || !location) {
      setError('Missing required information')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const orderData = {
        customerPhone: customer.phoneNumber,
        customerName: customer.name,
        location: location.address || 'Unknown Location',
        address: location.address || 'Unknown Address',
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        tip: cart.tip,
        total: calculateTotal(),
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
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Loading Order</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">Preparing your order confirmation...</p>
          </div>
          
          {/* Loading Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-600">Loading your order details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show success screen if order was submitted
  if (submittedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">✅ Order Submitted!</h1>
            <p className="text-green-100 text-xs sm:text-sm md:text-base text-center">Thank you for your order</p>
          </div>
          
          {/* Success Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
              <p className="text-xl text-green-600 font-semibold">Order #{submittedOrder?.id}</p>
              
              <div className="bg-green-50 rounded-2xl p-6 mt-6 text-left max-w-md mx-auto">
                <h3 className="font-bold text-green-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Customer:</span>
                    <span className="font-medium text-green-900">{customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Phone:</span>
                    <span className="font-medium text-green-900">{customer?.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Total:</span>
                    <span className="font-bold text-green-600 text-lg">${submittedOrder?.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mt-6 mb-4">
                You will be redirected to the order status page in a few seconds...
              </p>
              
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-card hover:shadow-card-hover"
                onClick={() => navigate(`/order-status/${submittedOrder?.id}`)}
              >
                View Order Status
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if missing essential data
  if (!hasCartItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Order Confirmation</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">No items found</p>
          </div>
          
          {/* Error Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Items in Cart</h3>
              <p className="text-gray-600 mb-6">Your cart is empty. Please add some items before proceeding.</p>
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-card hover:shadow-card-hover"
                onClick={() => navigate('/menu')}
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasCustomerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Order Confirmation</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">Customer info required</p>
          </div>
          
          {/* Error Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Information Required</h3>
              <p className="text-gray-600 mb-6">Please provide your information to proceed with the order.</p>
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-card hover:shadow-card-hover"
                onClick={() => navigate('/customer-info')}
              >
                Enter Customer Info
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
              onClick={() => navigate('/cart')}
            >
              ← <span className="hidden xs:inline">Back to Cart</span>
            </button>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">📋 Order Confirmation</h1>
              <p className="text-purple-100 text-xs sm:text-sm md:text-base">Review and submit your order</p>
            </div>
            <div className="w-8"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="p-4 sm:p-6 pb-24 space-y-6"> {/* Bottom padding for sticky button */}

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{customer.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{location?.address || 'Location not available'}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Order Items ({cart.items.length})</h3>
              
              <div className="space-y-4">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">${item.itemPrice.toFixed(2)} each</p>
                      
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
                  <span className="text-gray-900">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="text-gray-900">${cart.tip.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-purple-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="text-red-800">
                  <div className="font-bold mb-1">Order Submission Failed</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 rounded-b-3xl">
          <div className="space-y-2">
            <button 
              className="w-full bg-white text-purple-600 border-2 border-purple-600 font-medium py-2.5 px-6 rounded-xl hover:bg-purple-50 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/cart')}
              disabled={isSubmitting}
            >
              Back to Cart
            </button>
            
            <button 
              className={`w-full font-bold text-base sm:text-lg py-3 sm:py-4 px-6 rounded-xl shadow-lg transition-all ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:from-green-700 hover:to-emerald-700'
              }`}
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Submitting Order...' : '✅ Submit Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}