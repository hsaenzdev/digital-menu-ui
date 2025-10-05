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
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors"
            onClick={() => navigate('/menu')}
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Back to Menu</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">🛒 Your Cart</h1>
            <p className="text-fire-100 text-sm">Review your order</p>
          </div>
          {cart.items.length > 0 && (
            <button 
              className="text-white hover:text-red-200 font-medium flex items-center gap-1 transition-colors"
              onClick={handleClearCart}
            >
              <span className="text-xl">🗑️</span>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Customer Summary */}
        {customer && location && (
          <div className="flex gap-3 text-sm text-fire-50 mt-2 pt-2 border-t border-fire-400/30">
            <span className="flex items-center gap-1 truncate">
              👤 {customer.name}
            </span>
            <span className="flex items-center gap-1 truncate">
              📍 {location.address}
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-40">{/* Extra bottom padding for fixed buttons */}

            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-7xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some delicious items from our menu!</p>
                <button 
                  className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
                  onClick={handleContinueShopping}
                >
                  🔥 Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>🛒</span>
                    <span>Order Items ({cart.items.length})</span>
                  </h2>
                  
                  {cart.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-lg p-4 border-2 border-transparent hover:border-fire-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">{item.itemName}</h3>
                          <p className="text-sm text-gray-600 mb-2">${item.itemPrice.toFixed(2)} each</p>
                          
                          {/* Modifiers */}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="space-y-1 mb-2 bg-fire-50 p-2 rounded-lg">
                              {item.selectedModifiers.map((modifier, idx) => (
                                <div key={idx} className="text-sm text-fire-800">
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
                            <div className="text-sm text-fire-800 bg-amber-50 p-2 rounded border-l-4 border-fire-400">
                              <span className="font-medium">Note:</span> {item.specialNotes}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="font-bold text-xl bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">${item.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-colors shadow-md"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="font-bold text-gray-900 min-w-[2.5rem] text-center text-lg">{item.quantity}</span>
                          <button
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-fire-500 to-ember-500 hover:from-fire-600 hover:to-ember-600 flex items-center justify-center font-bold text-white transition-all shadow-md"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors flex items-center gap-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <span>🗑️</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tip Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-transparent hover:border-fire-300 transition-all">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>💰</span>
                    <span>Add Tip</span>
                  </h3>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[15, 18, 20, 25].map(percentage => (
                      <button
                        key={percentage}
                        className={`py-3 px-3 rounded-xl font-bold transition-all shadow-md ${
                          tipPercentage === percentage && !showCustomTip
                            ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-fire-50 hover:text-fire-600'
                        }`}
                        onClick={() => handleTipChange(percentage)}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      className={`py-3 px-6 rounded-xl font-bold transition-all shadow-md ${
                        showCustomTip
                          ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-fire-50'
                      }`}
                      onClick={() => setShowCustomTip(!showCustomTip)}
                    >
                      Custom
                    </button>
                    
                    {showCustomTip && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-bold text-lg">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customTip}
                          onChange={(e) => handleCustomTipChange(e.target.value)}
                          className="w-24 px-3 py-2 border-2 border-fire-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-fire-500"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-fire-50 to-amber-50 rounded-2xl shadow-lg p-4 border-2 border-fire-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <span>📊</span>
                    <span>Order Summary</span>
                  </h3>
                  
                  <div className="space-y-3 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="text-gray-900 font-bold">${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Tax:</span>
                      <span className="text-gray-900 font-bold">${cart.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Tip:</span>
                      <span className="text-gray-900 font-bold">${cart.tip.toFixed(2)}</span>
                    </div>
                    <hr className="my-2 border-fire-300" />
                    <div className="flex justify-between text-2xl font-bold pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Fixed Action Buttons - Always visible at bottom */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
          <div className="space-y-2">
            <button 
              className="w-full bg-white text-fire-600 border-2 border-fire-500 font-bold py-3 px-6 rounded-xl hover:bg-fire-50 transition-all shadow-md"
              onClick={handleContinueShopping}
            >
              ← Continue Shopping
            </button>
            
            {hasActiveOrders ? (
              <button 
                className="w-full bg-gray-300 text-gray-500 font-bold text-lg py-4 px-6 rounded-xl cursor-not-allowed shadow-md"
                disabled
                title="You have active orders. Please wait for them to complete."
              >
                🔒 Checkout Unavailable
              </button>
            ) : (
              <button 
                className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}