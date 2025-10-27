import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../../context/CartContext'
import { useActiveOrders } from '../../hooks/useActiveOrders'
import { ModifierSelectionModal } from '../../components/ModifierSelectionModal'
import { useMenuCategories } from './useMenuCategories'
import { useMenuItems } from './useMenuItems'
import {
  ActiveOrdersBanner,
  CategoryTab,
  CategoryInfo,
  MenuItemCard,
  ErrorMessage,
  LoadingState,
  EmptyState
} from './components'
import type { MenuItem, CartItem, SelectedModifier } from '../../types'

export const MenuPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { addItem, getItemCount } = useCart()
  const { hasActiveOrders, activeOrders } = useActiveOrders()

  // Use custom hooks for data fetching
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    getCategoryById,
    loading: categoriesLoading,
    error: categoriesError
  } = useMenuCategories()

  const {
    items,
    loading: itemsLoading,
    error: itemsError
  } = useMenuItems(selectedCategory)

  // Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModifierModal, setShowModifierModal] = useState(false)

  const handleAddToCart = (item: MenuItem) => {
    // Check if item has modifiers
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setSelectedItem(item)
      setShowModifierModal(true)
    } else {
      // Add directly to cart
      const cartItem: CartItem = {
        id: `${item.id}-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        itemPrice: item.price,
        unitPrice: item.price,
        totalPrice: item.price,
        selectedModifiers: [],
        specialNotes: ''
      }
      addItem(cartItem)
    }
  }

  const handleModalAddToCart = (
    selectedModifiers: SelectedModifier[],
    specialNotes: string,
    quantity: number
  ) => {
    if (selectedItem) {
      const modifierPrice = selectedModifiers.reduce((total, modifier) => {
        return total + modifier.selectedOptions.reduce(
          (optTotal, option) => optTotal + option.price,
          0
        )
      }, 0)

      const cartItem: CartItem = {
        id: `${selectedItem.id}-${Date.now()}`,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity,
        itemPrice: selectedItem.price,
        unitPrice: selectedItem.price,
        totalPrice: (selectedItem.price + modifierPrice) * quantity,
        selectedModifiers,
        specialNotes
      }

      addItem(cartItem)
      setShowModifierModal(false)
      setSelectedItem(null)
    }
  }

  const handleModifierCancel = () => {
    setShowModifierModal(false)
    setSelectedItem(null)
  }

  const goToCart = () => {
    navigate(`/${customerId}/cart`)
  }

  const error = categoriesError || itemsError
  const loading = categoriesLoading || itemsLoading

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
            🍽️ Our Menu
          </h1>

          <div className="w-9"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="pb-28">
          {/* Active Orders Warning Banner */}
          <ActiveOrdersBanner activeOrders={activeOrders} />

          {/* Error Message */}
          <ErrorMessage message={error} />

          {/* Category Tabs - Compact */}
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide sticky top-0 bg-gradient-to-b from-orange-50 to-white z-10">
            {categories.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>

          {/* Selected Category Info */}
          {selectedCategory && (
            <CategoryInfo description={getCategoryById(selectedCategory)?.description} />
          )}

          {/* Menu Items */}
          {loading ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="px-3 space-y-2.5">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  disabled={hasActiveOrders}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Cart Button */}
      {getItemCount() > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-2.5 shadow-2xl z-50">
          <button
            className="w-full bg-gradient-to-r from-fire-600 to-ember-600 text-white font-semibold text-sm py-2.5 rounded-lg shadow-lg hover:from-fire-700 hover:to-ember-700 transition-all flex items-center justify-center gap-2"
            onClick={goToCart}
          >
            <span className="text-lg">🛒</span>
            <span>View Cart ({getItemCount()} items)</span>
          </button>
        </div>
      ) : null}

      {/* Modifier Selection Modal */}
      {showModifierModal && selectedItem && (
        <ModifierSelectionModal
          item={selectedItem}
          onClose={handleModifierCancel}
          onAddToCart={handleModalAddToCart}
        />
      )}
    </div>
  )
}
