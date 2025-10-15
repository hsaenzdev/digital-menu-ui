import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCustomer } from '../context/CustomerContext'
import type { Order } from '../types'

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { cart, clearCart } = useCart()
  const { customer, location } = useCustomer()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasCartItems = cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0
  const hasCustomerInfo = customer?.id && customer?.name

  const calculateTotal = () => {
    if (!hasCartItems) return 0
    return cart.subtotal + cart.tax + cart.tip
  }

  const handleSubmitOrder = async () => {
    if (!hasCartItems || !hasCustomerInfo || !location || !customerId) {
      setError('Missing required information')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const orderData = {
        customerId, // Link order to customer (platform info accessed via customer relation)
        location: `${location.latitude},${location.longitude}`, // GPS coordinates
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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submittedOrder) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">✅ Order Submitted!</h1>
          <p className="text-green-100 text-sm mt-1 text-center">Thank you for your order</p>
        </div>
        
        {/* Success Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-green-50 to-white">
          <div className="p-4 pb-48">
            <div className="text-center py-12">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
              <p className="text-2xl text-green-600 font-bold">Order #{submittedOrder?.id}</p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mt-6 text-left shadow-lg">
                <h3 className="font-bold text-green-900 mb-3 text-lg">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Customer:</span>
                    <span className="font-bold text-green-900">{customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Total:</span>
                    <span className="font-bold text-green-600 text-xl">${submittedOrder?.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 font-medium mt-6 mb-6 text-lg">
                Your order has been successfully submitted! You can track its progress or browse more items.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-400 p-4 shadow-2xl z-50">
          <div className="space-y-2">
            <button 
              className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
              onClick={() => navigate(`/${customerId}/order-status/${submittedOrder?.id}`)}
            >
              📋 View Order Status
            </button>
            
            <button 
              className="w-full bg-white text-fire-600 border-2 border-fire-500 font-bold py-3 px-6 rounded-xl hover:bg-fire-50 transition-all shadow-md"
              onClick={() => navigate(`/${customerId}/orders`)}
            >
              📚 View Order History
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasCartItems) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order Confirmation</h1>
          <p className="text-fire-100 text-sm mt-1 text-center">No items found</p>
        </div>
        
        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-12 px-4">
            <div className="text-7xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Items in Cart</h3>
            <p className="text-gray-600 mb-6 text-lg">Your cart is empty. Please add some items before proceeding.</p>
            <button 
              className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
              onClick={() => navigate(`/${customerId}/menu`)}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasCustomerInfo) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order Confirmation</h1>
          <p className="text-fire-100 text-sm mt-1 text-center">Customer info required</p>
        </div>
        
        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-12 px-4">
            <div className="text-7xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Customer Information Required</h3>
            <p className="text-gray-600 mb-6 text-lg">Please provide your information to proceed with the order.</p>
            <button 
              className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
              onClick={() => navigate(`/${customerId}/setup`)}
            >
              Enter Customer Info
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
            onClick={() => navigate(`/${customerId}/cart`)}
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order Confirmation</h1>
        <p className="text-fire-100 text-sm mt-1 text-center">Review and submit your order</p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-40 space-y-6">

          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fire-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Customer Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="font-bold text-gray-900">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Location:</span>
                <span className="font-bold text-gray-900">{location?.address || 'Location not available'}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fire-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Items ({cart.items.length})</h3>
            
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gradient-to-r from-fire-50 to-ember-50 rounded-xl border border-fire-200">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.itemName}</h4>
                    <p className="text-sm text-gray-600 font-medium">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600 font-medium">${item.itemPrice.toFixed(2)} each</p>
                    
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
                <span className="text-gray-900 font-bold">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Tax:</span>
                <span className="text-gray-900 font-bold">${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Tip:</span>
                <span className="text-gray-900 font-bold">${cart.tip.toFixed(2)}</span>
              </div>
              <hr className="my-2 border-fire-200" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-fire-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-md">
              <div className="text-red-800">
                <div className="font-bold mb-1">Order Submission Failed</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
        <div className="space-y-2">
          <button 
            className="w-full bg-white text-fire-600 border-2 border-fire-500 font-bold py-3 px-6 rounded-xl hover:bg-fire-50 transition-all shadow-md"
            onClick={() => navigate(`/${customerId}/cart`)}
            disabled={isSubmitting}
          >
            Back to Cart
          </button>
          
          <button 
            className={`w-full font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition-all ${
              isSubmitting 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform active:scale-95'
            }`}
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Submitting Order...' : '✅ Submit Order'}
          </button>
        </div>
      </div>
    </div>
  )
}