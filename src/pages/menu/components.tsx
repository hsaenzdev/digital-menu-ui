import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { MenuItem, MenuCategory, Order } from '../../types'

// ============================================================================
// ACTIVE ORDERS BANNER
// ============================================================================

interface ActiveOrdersBannerProps {
  activeOrders: Order[]
}

export const ActiveOrdersBanner: React.FC<ActiveOrdersBannerProps> = ({ activeOrders }) => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()

  if (activeOrders.length === 0) return null

  return (
    <div className="bg-amber-50 border-l-4 border-fire-400 p-2.5 m-3 rounded-lg shadow-sm">
      <div className="flex items-start gap-2">
        <div className="text-xl">⚠️</div>
        <div className="flex-1">
          <h4 className="font-bold text-fire-800 text-xs mb-0.5">
            Active Order{activeOrders.length > 1 ? 's' : ''} in Progress
          </h4>
          <p className="text-fire-700 text-xs">
            {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}. Wait to complete
            before placing new orders.
          </p>
        </div>
        <button
          className="bg-fire-500 text-white font-medium px-2.5 py-1 rounded-md hover:bg-fire-600 transition-colors text-xs whitespace-nowrap"
          onClick={() => navigate(`/${customerId}/orders`)}
        >
          View
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// CATEGORY TAB
// ============================================================================

interface CategoryTabProps {
  category: MenuCategory
  isSelected: boolean
  onClick: () => void
}

export const CategoryTab: React.FC<CategoryTabProps> = ({ category, isSelected, onClick }) => {
  return (
    <button
      className={`px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-fire-50 hover:text-fire-600 border border-gray-200'
      }`}
      onClick={onClick}
    >
      {category.name}
    </button>
  )
}

// ============================================================================
// CATEGORY INFO
// ============================================================================

interface CategoryInfoProps {
  description?: string
}

export const CategoryInfo: React.FC<CategoryInfoProps> = ({ description }) => {
  if (!description) return null

  return (
    <div className="bg-gradient-to-r from-fire-50 to-amber-50 border border-fire-200 rounded-lg p-2 mx-3 mb-3 text-gray-700 text-xs">
      {description}
    </div>
  )
}

// ============================================================================
// MENU ITEM CARD
// ============================================================================

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
  disabled?: boolean
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart, disabled = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
      <div className="flex gap-2.5 p-2.5">
        {/* Image Placeholder */}
        <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-fire-100 to-amber-100 rounded-lg flex items-center justify-center">
          <span className="text-4xl">🍔</span>
        </div>

        {/* Item Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {item.name}
          </h3>
          <p className="text-gray-600 text-xs line-clamp-2 mb-2">
            {item.description}
          </p>

          {item.allergens && item.allergens.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mb-2">
              <div className="flex items-center gap-0.5 text-amber-800 text-xs">
                <span className="text-sm">⚠️</span>
                <span className="truncate">
                  {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">
              ${item.price.toFixed(2)}
            </span>
            <button
              className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              onClick={() => onAddToCart(item)}
              disabled={disabled}
            >
              <span>🛒</span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ERROR MESSAGE
// ============================================================================

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-2.5 m-3 rounded-lg flex items-center gap-2 text-red-700 shadow-sm text-sm">
      <span className="text-lg">❌</span>
      <span>{message}</span>
    </div>
  )
}

// ============================================================================
// LOADING STATE
// ============================================================================

export const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3 animate-bounce">🔥</div>
      <p className="text-gray-600 text-sm font-medium">Loading delicious options...</p>
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3">🍽️</div>
      <p className="text-gray-600 text-sm">No items in this category</p>
    </div>
  )
}
