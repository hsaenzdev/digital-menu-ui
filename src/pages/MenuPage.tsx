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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <button 
              className="text-white hover:text-purple-100 font-medium flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/customer-info')}
            >
              ← <span className="hidden xs:inline">Back</span>
            </button>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">🍽️ Our Menu</h1>
              <p className="text-purple-100 text-xs sm:text-sm md:text-base">Choose your favorite dishes</p>
            </div>
            <div className="w-8"></div> {/* Spacer for layout balance */}
          </div>

          {/* Customer Summary */}
          {(customer || location) && (
            <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 text-xs sm:text-sm text-purple-100">
              {customer && (
                <span className="flex items-center gap-1 truncate">
                  👤 <span className="truncate">{customer.name}</span>
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 truncate">
                  📍 <span className="truncate">{location.address}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="p-4 sm:p-6 pb-24"> {/* Bottom padding for sticky button */}

            {/* Active Orders Warning Banner */}
            {hasActiveOrders && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-800 mb-1">
                      Active Order{activeOrders.length > 1 ? 's' : ''} in Progress
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      You have {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}. Browse the menu, but wait for current orders to complete before placing a new one.
                    </p>
                  </div>
                  <button 
                    className="bg-yellow-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm whitespace-nowrap"
                    onClick={() => navigate('/orders')}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-lg flex items-center gap-2 text-red-700">
                <span className="text-2xl">❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium whitespace-nowrap transition-all text-sm sm:text-base ${
                    selectedCategory === category.id 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-card' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Selected Category Info */}
            {selectedCategory && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-gray-700 text-sm sm:text-base">
                {categories.find(c => c.id === selectedCategory)?.description}
              </div>
            )}

            {/* Menu Items */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading delicious options...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🍽️</div>
                <p className="text-gray-600">No items found in this category</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-3 sm:p-4 md:p-6 border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm sm:text-base mb-3">{item.description}</p>
                        
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-1 text-orange-800 text-sm">
                              <span>⚠️</span>
                              <span className="font-medium">Contains:</span>
                              <span>{Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-purple-600">${item.price.toFixed(2)}</span>
                          <button
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all text-sm sm:text-base"
                            onClick={() => handleAddToCart(item)}
                            disabled={hasActiveOrders}
                          >
                            Add to Cart
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

        {/* Fixed Cart Footer - positioned relative to container */}
        {getItemCount() > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg rounded-b-3xl">
            <button 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all"
              onClick={goToCart}
            >
              View Cart ({getItemCount()} items) →
            </button>
          </div>
        )}
      </div>

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