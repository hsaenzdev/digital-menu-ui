import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useActiveOrders } from '../hooks/useActiveOrders'
import { ModifierSelectionModal } from '../components/ModifierSelectionModal'
import type { MenuCategory, MenuItem, CartItem, ApiResponse, SelectedModifier } from '../types'

export const MenuPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { addItem, getItemCount } = useCart()
  const { hasActiveOrders, activeOrders } = useActiveOrders()
  
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModifierModal, setShowModifierModal] = useState(false)

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories')
        const data: ApiResponse<MenuCategory[]> = await response.json()
        
        if (data.success && data.data) {
          setCategories(data.data)
          // Auto-select first category
          if (data.data.length > 0 && !selectedCategory) {
            setSelectedCategory(data.data[0].id)
          }
        } else {
          setError('Failed to load categories')
        }
      } catch {
        setError('Failed to load menu categories')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [selectedCategory])

  // Fetch items when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryItems(selectedCategory)
    }
  }, [selectedCategory])

  const fetchCategoryItems = async (categoryId: string) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/menu/categories/${categoryId}/items`)
      const data: ApiResponse<MenuItem[]> = await response.json()
      
      if (data.success && data.data) {
        setItems(data.data)
      } else {
        setError('Failed to load menu items')
        setItems([])
      }
    } catch {
      setError('Failed to load menu items')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

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

  // Wrapper function for the modal
  const handleModalAddToCart = (selectedModifiers: SelectedModifier[], specialNotes: string, quantity: number) => {
    if (selectedItem) {
      const modifierPrice = selectedModifiers.reduce((total, modifier) => {
        return total + modifier.selectedOptions.reduce((optTotal, option) => optTotal + option.price, 0)
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header - Consistent */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold text-center drop-shadow-md">🍽️ Our Menu</h1>
      </div>

      {/* Floating Home Button */}
      <button
        onClick={() => navigate(`/${customerId}`)}
        className="fixed top-16 left-3 z-40 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-50 transition-all border-2 border-fire-400"
        title="Back to Home"
      >
        🏠
      </button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="pb-28">

            {/* Active Orders Warning Banner */}
            {hasActiveOrders && (
              <div className="bg-amber-50 border-l-4 border-fire-400 p-2.5 m-3 rounded-lg shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="text-xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-fire-800 text-xs mb-0.5">
                      Active Order{activeOrders.length > 1 ? 's' : ''} in Progress
                    </h4>
                    <p className="text-fire-700 text-xs">
                      {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}. Wait to complete before placing new orders.
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
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-2.5 m-3 rounded-lg flex items-center gap-2 text-red-700 shadow-sm text-sm">
                <span className="text-lg">❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Category Tabs - Compact */}
            <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-hide sticky top-0 bg-gradient-to-b from-orange-50 to-white z-10">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category.id 
                      ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-fire-50 hover:text-fire-600 border border-gray-200'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Selected Category Info - Compact */}
            {selectedCategory && (
              <div className="bg-gradient-to-r from-fire-50 to-amber-50 border border-fire-200 rounded-lg p-2 mx-3 mb-3 text-gray-700 text-xs">
                {categories.find(c => c.id === selectedCategory)?.description}
              </div>
            )}

            {/* Menu Items - With Image Placeholders */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 animate-bounce">🔥</div>
                <p className="text-gray-600 text-sm font-medium">Loading delicious options...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🍽️</div>
                <p className="text-gray-600 text-sm">No items in this category</p>
              </div>
            ) : (
              <div className="px-3 space-y-2.5">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
                    <div className="flex gap-2.5 p-2.5">
                      {/* Image Placeholder */}
                      <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-fire-100 to-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">🍔</span>
                      </div>
                      
                      {/* Item Content */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">{item.description}</p>
                        
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
                            onClick={() => handleAddToCart(item)}
                            disabled={hasActiveOrders}
                          >
                            <span>🛒</span>
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Fixed Bottom Buttons - Compact */}
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