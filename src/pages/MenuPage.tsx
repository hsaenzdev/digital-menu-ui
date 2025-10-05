import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import { useCart } from '../context/CartContext'
import { useActiveOrders } from '../hooks/useActiveOrders'
import { ModifierSelectionModal } from '../components/ModifierSelectionModal'
import type { MenuCategory, MenuItem, CartItem, ApiResponse, SelectedModifier } from '../types'

export const MenuPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer, location } = useCustomer()
  const { addItem, getItemCount } = useCart()
  const { hasActiveOrders, activeOrders } = useActiveOrders()
  
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModifierModal, setShowModifierModal] = useState(false)

  // Redirect if no customer info (temporarily disabled for testing)
  useEffect(() => {
    // if (!customer || !location) {
    //   navigate('/customer-info')
    // }
  }, [customer, location, navigate])

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories')
        const data: ApiResponse<MenuCategory[]> = await response.json()
        
        console.log('Categories response:', data) // Debug log
        
        if (data.success && data.data) {
          setCategories(data.data)
          // Auto-select first category
          if (data.data.length > 0 && !selectedCategory) {
            setSelectedCategory(data.data[0].id)
          }
        } else {
          setError('Failed to load categories')
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
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
      
      console.log('Items response:', data) // Debug log
      
      if (data.success && data.data) {
        setItems(data.data)
      } else {
        setError('Failed to load menu items')
        setItems([])
      }
    } catch (err) {
      console.error('Error fetching items:', err)
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
    navigate('/cart')
  }

  if (!customer || !location) {
    // return <div>Redirecting...</div>
    // Temporarily allow access for testing
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors"
            onClick={() => navigate('/customer-info')}
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">🔥 Our Menu</h1>
            <p className="text-fire-100 text-sm">Delicious food delivered hot!</p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Customer Summary */}
        {(customer || location) && (
          <div className="flex gap-3 text-sm text-fire-50 mt-2 pt-2 border-t border-fire-400/30">
            {customer && (
              <span className="flex items-center gap-1 truncate">
                👤 {customer.name}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1 truncate">
                📍 {location.address}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-32">{/* Extra bottom padding for fixed button */}

            {/* Active Orders Warning Banner */}
            {hasActiveOrders && (
              <div className="bg-amber-50 border-l-4 border-fire-400 p-4 mb-4 rounded-lg shadow-md">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-fire-800 mb-1">
                      Active Order{activeOrders.length > 1 ? 's' : ''} in Progress
                    </h4>
                    <p className="text-fire-700 text-sm">
                      You have {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}. Browse the menu, but wait for current orders to complete before placing a new one.
                    </p>
                  </div>
                  <button 
                    className="bg-fire-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-fire-600 transition-colors text-sm whitespace-nowrap"
                    onClick={() => navigate('/orders')}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-lg flex items-center gap-2 text-red-700 shadow-md">
                <span className="text-2xl">❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-md ${
                    selectedCategory === category.id 
                      ? 'bg-gradient-to-r from-fire-500 to-ember-500 text-white scale-105' 
                      : 'bg-white text-gray-700 hover:bg-fire-50 hover:text-fire-600'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Selected Category Info */}
            {selectedCategory && (
              <div className="bg-gradient-to-r from-fire-50 to-amber-50 border border-fire-200 rounded-xl p-4 mb-6 text-gray-700 shadow-sm">
                {categories.find(c => c.id === selectedCategory)?.description}
              </div>
            )}

            {/* Menu Items */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">🔥</div>
                <p className="text-gray-600 font-medium">Loading delicious options...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-600">No items found in this category</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 border-2 border-transparent hover:border-fire-300">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="bg-fire-50 border border-fire-300 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-1 text-fire-800 text-sm font-medium">
                              <span>⚠️</span>
                              <span>Contains:</span>
                              <span>{Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold bg-gradient-to-r from-fire-600 to-ember-600 bg-clip-text text-transparent">
                            ${item.price.toFixed(2)}
                          </span>
                          <button
                            className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAddToCart(item)}
                            disabled={hasActiveOrders}
                          >
                            🛒 Add to Cart
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

      {/* Fixed Cart Button - Always visible at bottom */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
          <button 
            className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={goToCart}
          >
            <span className="text-2xl">🛒</span>
            <span>View Cart ({getItemCount()} items)</span>
            <span className="text-2xl">→</span>
          </button>
        </div>
      )}

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