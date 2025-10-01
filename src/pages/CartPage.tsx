import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import { useCart } from '../context/CartContext'
import { useActiveOrders } from '../hooks/useActiveOrders'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer, location } = useCustomer()
  const { cart, updateItem, removeItem, clearCart, updateTip } = useCart()
  const { hasActiveOrders } = useActiveOrders()
  
  const [tipPercentage, setTipPercentage] = useState<number>(15)
  const [customTip, setCustomTip] = useState<string>('')
  const [showCustomTip, setShowCustomTip] = useState(false)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateItem(itemId, { quantity: newQuantity })
    }
  }

  const handleTipChange = (percentage: number) => {
    setTipPercentage(percentage)
    setShowCustomTip(false)
    setCustomTip('')
    const tipAmount = (cart.subtotal * percentage) / 100
    updateTip(tipAmount)
  }

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value)
    const tipAmount = parseFloat(value) || 0
    updateTip(tipAmount)
    setTipPercentage(0) // Reset percentage when using custom tip
  }

  const handleProceedToCheckout = () => {
    if (cart.items.length === 0) {
      return
    }
    navigate('/order-confirmation')
  }

  const handleContinueShopping = () => {
    navigate('/menu')
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
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
              ← <span className="hidden xs:inline">Back to Menu</span>
            </button>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">🛒 Your Cart</h1>
              <p className="text-purple-100 text-xs sm:text-sm md:text-base">Review your order</p>
            </div>
            {cart.items.length > 0 && (
              <button 
                className="text-white hover:text-red-200 font-medium flex items-center gap-1 transition-colors text-sm sm:text-base"
                onClick={handleClearCart}
              >
                🗑️ <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Customer Summary */}
          {customer && location && (
            <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 text-xs sm:text-sm text-purple-100 mt-3 pt-3 border-t border-purple-400">
              <span className="flex items-center gap-1 truncate">
                👤 <span className="truncate">{customer.name}</span>
              </span>
              <span className="flex items-center gap-1 truncate">
                📍 <span className="truncate">{location.address}</span>
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="p-4 sm:p-6 pb-24"> {/* Bottom padding for sticky button */}

            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-7xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some delicious items from our menu!</p>
                <button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all"
                  onClick={handleContinueShopping}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Order Items ({cart.items.length})</h2>
                  
                  {cart.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{item.itemName}</h3>
                          <p className="text-sm text-gray-600 mb-2">${item.itemPrice.toFixed(2)} each</p>
                          
                          {/* Modifiers */}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="space-y-1 mb-2">
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
                          
                          {/* Special Notes */}
                          {item.specialNotes && (
                            <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                              <span className="font-medium">Note:</span> {item.specialNotes}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="font-bold text-lg text-purple-600">${item.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-colors"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="font-medium text-gray-900 min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center font-bold text-white transition-colors"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tip Selection */}
                <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Add Tip</h3>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[15, 18, 20, 25].map(percentage => (
                      <button
                        key={percentage}
                        className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                          tipPercentage === percentage && !showCustomTip
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-card'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleTipChange(percentage)}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      className={`py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                        showCustomTip
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-card'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setShowCustomTip(!showCustomTip)}
                    >
                      Custom
                    </button>
                    
                    {showCustomTip && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customTip}
                          onChange={(e) => handleCustomTipChange(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          placeholder="0.00"
                        />
                      </div>
                    )}
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
                      <span className="text-purple-600">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        {cart.items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 rounded-b-3xl">
            <div className="space-y-2">
              <button 
                className="w-full bg-white text-purple-600 border-2 border-purple-600 font-medium py-2.5 px-6 rounded-xl hover:bg-purple-50 transition-colors text-sm sm:text-base"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
              
              {hasActiveOrders ? (
                <button 
                  className="w-full bg-gray-300 text-gray-500 font-bold text-base sm:text-lg py-3 px-6 rounded-xl cursor-not-allowed"
                  disabled
                  title="You have active orders. Please wait for them to complete."
                >
                  🔒 Checkout Unavailable
                </button>
              ) : (
                <button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}