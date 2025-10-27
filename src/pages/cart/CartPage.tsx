import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../../context/CartContext'
import { useActiveOrders } from '../../hooks/useActiveOrders'
import {
  EmptyCart,
  CartItemCard,
  TipSelector,
  OrderSummary
} from './components'
import { calculateTipByPercentage, parseCustomTip, DEFAULT_TIP_PERCENTAGE } from './cartUtils'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { cart, updateItem, removeItem, clearCart, updateTip } = useCart()
  const { hasActiveOrders } = useActiveOrders()

  const [tipPercentage, setTipPercentage] = useState<number>(DEFAULT_TIP_PERCENTAGE)
  const [customTip, setCustomTip] = useState<string>('')
  const [showCustomTip, setShowCustomTip] = useState(false)
  const hasInitializedTip = useRef(false)

  // Apply default tip on initial mount only
  useEffect(() => {
    if (cart.subtotal > 0 && !hasInitializedTip.current) {
      hasInitializedTip.current = true
      const tipAmount = calculateTipByPercentage(cart.subtotal, DEFAULT_TIP_PERCENTAGE)
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

  const handleTipPercentageSelect = (percentage: number) => {
    setTipPercentage(percentage)
    setShowCustomTip(false)
    setCustomTip('')
    const tipAmount = calculateTipByPercentage(cart.subtotal, percentage)
    updateTip(tipAmount)
  }

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value)
    const tipAmount = parseCustomTip(value)
    updateTip(tipAmount)
    setTipPercentage(0) // Reset percentage when using custom tip
  }

  const handleProceedToCheckout = () => {
    if (cart.items.length === 0) return
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
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header */}
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
            <EmptyCart onContinueShopping={handleContinueShopping} />
          ) : (
            <div className="space-y-3 px-3 pt-3">
              {/* Cart Items */}
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 px-1">
                  <span>🛒</span>
                  <span>Order Items ({cart.items.length})</span>
                </h2>

                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={(newQuantity) => handleQuantityChange(item.id, newQuantity)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>

              {/* Tip Selection */}
              <TipSelector
                selectedPercentage={tipPercentage}
                customTip={customTip}
                showCustom={showCustomTip}
                onPercentageSelect={handleTipPercentageSelect}
                onCustomTipChange={handleCustomTipChange}
                onToggleCustom={() => setShowCustomTip(!showCustomTip)}
              />

              {/* Order Summary */}
              <OrderSummary
                subtotal={cart.subtotal}
                tax={cart.tax}
                tip={cart.tip}
                total={cart.total}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons */}
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
