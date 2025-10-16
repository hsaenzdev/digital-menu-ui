import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../context/CartContext'
import { useActiveOrders } from '../hooks/useActiveOrders'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { cart, updateItem, removeItem, clearCart, updateTip } = useCart()
  const { hasActiveOrders } = useActiveOrders()
  
  const [tipPercentage, setTipPercentage] = useState<number>(15)
  const [customTip, setCustomTip] = useState<string>('')
  const [showCustomTip, setShowCustomTip] = useState(false)
  const hasInitializedTip = useRef(false)

  // Apply default 15% tip on initial mount only
  useEffect(() => {
    if (cart.subtotal > 0 && !hasInitializedTip.current) {
      hasInitializedTip.current = true
      const tipAmount = (cart.subtotal * 15) / 100
      updateTip(tipAmount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    navigate(`/${customerId}/order-confirmation`)
  }

  const handleContinueShopping = () => {
    navigate(`/${customerId}/menu`)
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
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
          <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">
            🛒 Your Cart {cart.items.length > 0 && `(${cart.items.length})`}
          </h1>
          {cart.items.length > 0 ? (
            <button 
              className="text-white hover:text-red-200 font-medium flex items-center gap-1 transition-colors text-xs w-9 justify-end"
              onClick={handleClearCart}
            >
              <span className="text-base">🗑️</span>
              <span>Clear</span>
            </button>
          ) : (
            <div className="w-9"></div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="pb-40">

            {cart.items.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-6xl mb-3">🛒</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 text-sm mb-4">Add some delicious items from our menu!</p>
                <button 
                  className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all text-sm"
                  onClick={handleContinueShopping}
                >
                  🔥 Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3 px-3 pt-3">
                {/* Cart Items */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 px-1">
                    <span>🛒</span>
                    <span>Order Items ({cart.items.length})</span>
                  </h2>
                  
                  {cart.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.itemName}</h3>
                          <p className="text-xs text-gray-600">${item.itemPrice.toFixed(2)} each</p>
                          
                          {/* Modifiers */}
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="space-y-0.5 mt-1.5 bg-fire-50 p-1.5 rounded-md">
                              {item.selectedModifiers.map((modifier, idx) => (
                                <div key={idx} className="text-xs text-fire-800">
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
                            <div className="text-xs text-fire-800 bg-amber-50 p-1.5 rounded border-l-2 border-fire-400 mt-1.5">
                              <span className="font-medium">Note:</span> {item.specialNotes}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-3">
                          <div className="font-bold text-base bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">${item.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Quantity Controls - Compact */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-colors text-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="font-bold text-gray-900 min-w-[2rem] text-center text-sm">{item.quantity}</span>
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-fire-500 to-ember-500 hover:from-fire-600 hover:to-ember-600 flex items-center justify-center font-bold text-white transition-all text-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          className="text-red-600 hover:text-red-700 font-semibold text-xs transition-colors flex items-center gap-0.5"
                          onClick={() => removeItem(item.id)}
                        >
                          <span className="text-sm">🗑️</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tip Selection - Compact */}
                <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                    <span>💰</span>
                    <span>Add Tip</span>
                  </h3>
                  
                  {/* Percentage Options in 3x2 Grid - Compact */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {[15, 18, 20, 25].map(percentage => (
                      <button
                        key={percentage}
                        className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                          tipPercentage === percentage && !showCustomTip
                            ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-fire-50 hover:text-fire-600'
                        }`}
                        onClick={() => handleTipChange(percentage)}
                      >
                        {percentage}%
                      </button>
                    ))}
                    <button
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                        tipPercentage === 0 && !showCustomTip
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleTipChange(0)}
                    >
                      No Tip
                    </button>
                  </div>
                  
                  {/* Custom Tip Button */}
                  <button
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                      showCustomTip
                        ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-fire-50 hover:text-fire-600'
                    }`}
                    onClick={() => setShowCustomTip(!showCustomTip)}
                  >
                    Custom
                  </button>
                  
                  {/* Custom Tip Input - Compact */}
                  {showCustomTip && (
                    <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-fire-50 rounded-lg border border-fire-200">
                      <span className="text-gray-700 font-bold text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customTip}
                        onChange={(e) => handleCustomTipChange(e.target.value)}
                        className="w-24 px-2 py-1.5 border border-fire-300 rounded-md text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-fire-500"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                {/* Order Summary - Compact */}
                <div className="bg-gradient-to-br from-fire-50 to-amber-50 rounded-xl shadow-md p-3 border border-fire-200">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
                    <span>📊</span>
                    <span>Order Summary</span>
                  </h3>
                  
                  <div className="space-y-1.5 text-sm">
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
                    <hr className="my-1.5 border-fire-300" />
                    <div className="flex justify-between text-lg font-bold pt-1">
                      <span className="text-gray-900">Total:</span>
                      <span className="bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Fixed Action Buttons - Compact */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-2.5 shadow-2xl z-50">
          <div className="space-y-1.5">
            <button 
              className="w-full bg-white text-fire-600 border border-fire-500 font-semibold text-xs py-2 px-4 rounded-lg hover:bg-fire-50 transition-all"
              onClick={handleContinueShopping}
            >
              🍽️ Add More Items
            </button>
            
            {hasActiveOrders ? (
              <button 
                className="w-full bg-gray-300 text-gray-500 font-semibold text-sm py-2.5 px-4 rounded-lg cursor-not-allowed shadow-md"
                disabled
                title="You have active orders. Please wait for them to complete."
              >
                🔒 Checkout Unavailable
              </button>
            ) : (
              <button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                onClick={handleProceedToCheckout}
              >
                ✅ Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}