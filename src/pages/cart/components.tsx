import React from 'react'
import type { CartItem } from '../../types'
import { TIP_PERCENTAGES } from './cartUtils'

// ============================================================================
// EMPTY CART STATE
// ============================================================================

interface EmptyCartProps {
  onContinueShopping: () => void
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onContinueShopping }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-3">🛒</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 text-sm mb-4">Add some delicious items from our menu!</p>
      <button
        className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all text-sm"
        onClick={onContinueShopping}
      >
        🔥 Browse Menu
      </button>
    </div>
  )
}

// ============================================================================
// CART ITEM CARD
// ============================================================================

interface CartItemCardProps {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
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
          <div className="font-bold text-base bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">
            ${item.totalPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-colors text-sm"
            onClick={() => onQuantityChange(item.quantity - 1)}
          >
            -
          </button>
          <span className="font-bold text-gray-900 min-w-[2rem] text-center text-sm">
            {item.quantity}
          </span>
          <button
            className="w-8 h-8 rounded-full bg-gradient-to-r from-fire-500 to-ember-500 hover:from-fire-600 hover:to-ember-600 flex items-center justify-center font-bold text-white transition-all text-sm"
            onClick={() => onQuantityChange(item.quantity + 1)}
          >
            +
          </button>
        </div>

        <button
          className="text-red-600 hover:text-red-700 font-semibold text-xs transition-colors flex items-center gap-0.5"
          onClick={onRemove}
        >
          <span className="text-sm">🗑️</span>
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// TIP SELECTOR
// ============================================================================

interface TipSelectorProps {
  selectedPercentage: number
  customTip: string
  showCustom: boolean
  onPercentageSelect: (percentage: number) => void
  onCustomTipChange: (value: string) => void
  onToggleCustom: () => void
}

export const TipSelector: React.FC<TipSelectorProps> = ({
  selectedPercentage,
  customTip,
  showCustom,
  onPercentageSelect,
  onCustomTipChange,
  onToggleCustom
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100">
      <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
        <span>💰</span>
        <span>Add Tip</span>
      </h3>

      {/* Percentage Options */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {TIP_PERCENTAGES.map((percentage) => (
          <button
            key={percentage}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
              selectedPercentage === percentage && !showCustom
                ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-fire-50 hover:text-fire-600'
            }`}
            onClick={() => onPercentageSelect(percentage)}
          >
            {percentage}%
          </button>
        ))}
        <button
          className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            selectedPercentage === 0 && !showCustom
              ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onPercentageSelect(0)}
        >
          No Tip
        </button>
      </div>

      {/* Custom Tip Button */}
      <button
        className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
          showCustom
            ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-fire-50 hover:text-fire-600'
        }`}
        onClick={onToggleCustom}
      >
        Custom
      </button>

      {/* Custom Tip Input */}
      {showCustom && (
        <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-fire-50 rounded-lg border border-fire-200">
          <span className="text-gray-700 font-bold text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={customTip}
            onChange={(e) => onCustomTipChange(e.target.value)}
            className="w-24 px-2 py-1.5 border border-fire-300 rounded-md text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-fire-500"
            placeholder="0.00"
          />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ORDER SUMMARY
// ============================================================================

interface OrderSummaryProps {
  subtotal: number
  tax: number
  tip: number
  total: number
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal, tax, tip, total }) => {
  return (
    <div className="bg-gradient-to-br from-fire-50 to-amber-50 rounded-xl shadow-md p-3 border border-fire-200">
      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
        <span>📊</span>
        <span>Order Summary</span>
      </h3>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Subtotal:</span>
          <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Tax:</span>
          <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">Tip:</span>
          <span className="text-gray-900 font-bold">${tip.toFixed(2)}</span>
        </div>
        <hr className="my-1.5 border-fire-300" />
        <div className="flex justify-between text-lg font-bold pt-1">
          <span className="text-gray-900">Total:</span>
          <span className="bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
