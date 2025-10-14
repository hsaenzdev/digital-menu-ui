import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Category, MenuItem, MenuItemFormData, ModifierGroup } from '../../types/menu-manager'

const API_URL = '/api/menu-manager'
const PUBLIC_API_URL = '/api/menu'

export const ItemManager: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])
  const [selectedModifierGroups, setSelectedModifierGroups] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')
  const [filterDietary, setFilterDietary] = useState<string>('all')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkActionMode, setBulkActionMode] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const { token } = useAuth()

  const [formData, setFormData] = useState<MenuItemFormData>({
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: true,
    isSpecial: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    displayOrder: 0,
    preparationTime: undefined,
    calories: undefined,
    allergens: ''
  })

  // Fetch all data
  const fetchData = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      
      const [itemsRes, categoriesRes, modifierGroupsRes] = await Promise.all([
        fetch(`${API_URL}/items`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${PUBLIC_API_URL}/categories`),
        fetch(`${API_URL}/modifier-groups`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      const [itemsData, categoriesData, modifierGroupsData] = await Promise.all([
        itemsRes.json(),
        categoriesRes.json(),
        modifierGroupsRes.json()
      ])

      if (itemsData.success) {
        setItems(itemsData.items)
      } else {
        setError(itemsData.error || 'Failed to load items')
      }
      
      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }
      
      if (modifierGroupsData.success) {
        setModifierGroups(modifierGroupsData.groups)
      }
    } catch {
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Handle image upload
  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile || !token) return null

    const uploadFormData = new FormData()
    uploadFormData.append('image', imageFile)

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData
      })

      const data = await response.json()
      if (data.success) {
        return data.imageUrl
      }
    } catch {
      setError('Failed to upload image')
    }
    return null
  }

  // Update modifier group associations
  const updateModifierGroups = async (itemId: string) => {
    if (!token) return

    try {
      // Get current modifier groups for this item
      const currentGroups = editingItem?.modifierGroups?.map(mg => mg.modifierGroupId) || []
      
      // Find groups to add (in selectedModifierGroups but not in currentGroups)
      const groupsToAdd = selectedModifierGroups.filter(id => !currentGroups.includes(id))
      
      // Find groups to remove (in currentGroups but not in selectedModifierGroups)
      const groupsToRemove = currentGroups.filter(id => !selectedModifierGroups.includes(id))
      
      // Link new modifier groups
      for (const groupId of groupsToAdd) {
        await fetch(`${API_URL}/items/${itemId}/modifier-groups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ modifierGroupId: groupId })
        })
      }
      
      // Unlink removed modifier groups
      for (const groupId of groupsToRemove) {
        await fetch(`${API_URL}/items/${itemId}/modifier-groups/${groupId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
    } catch {
      setError('Failed to update modifier groups')
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      let imageUrl = formData.imageUrl

      // Upload image if new file selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload()
        if (uploadedUrl) imageUrl = uploadedUrl
      }

      const url = editingItem
        ? `${API_URL}/items/${editingItem.id}`
        : `${API_URL}/items`

      const response = await fetch(url, {
        method: editingItem ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, imageUrl })
      })

      const data = await response.json()
      if (data.success) {
        const itemId = editingItem?.id || data.item?.id
        
        // Update modifier group associations
        if (itemId) {
          await updateModifierGroups(itemId)
        }
        
        // Update state directly instead of refetching
        if (editingItem) {
          // Update existing item
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === editingItem.id 
                ? { ...item, ...formData, imageUrl, updatedAt: new Date().toISOString() }
                : item
            )
          )
        } else {
          // Add new item
          const newItem = {
            ...data.item,
            id: data.item.id,
            categoryId: formData.categoryId,
            name: formData.name,
            description: formData.description || '',
            price: formData.price,
            imageUrl: imageUrl || '',
            displayOrder: formData.displayOrder || 0,
            isAvailable: formData.isAvailable !== false,
            isActive: true,
            isSpecial: formData.isSpecial || false,
            isVegetarian: formData.isVegetarian || false,
            isVegan: formData.isVegan || false,
            isGlutenFree: formData.isGlutenFree || false,
            isSpicy: formData.isSpicy || false,
            preparationTime: formData.preparationTime,
            calories: formData.calories,
            allergens: formData.allergens || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setItems(prevItems => [...prevItems, newItem])
        }
        handleCloseModal()
      }
    } catch {
      setError('Failed to save item')
    }
  }

  // Delete item
  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this item?')) return

    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      if (data.success) {
        // Remove item from state directly
        setItems(prevItems => prevItems.filter(item => item.id !== id))
      }
    } catch {
      setError('Failed to delete item')
    }
  }

  // Toggle availability
  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/items/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !isAvailable })
      })
      
      const data = await response.json()
      if (data.success) {
        // Update availability in state directly
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id
              ? { ...item, isAvailable: !isAvailable }
              : item
          )
        )
      }
    } catch {
      setError('Failed to toggle availability')
    }
  }

  // Bulk selection handlers
  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }

  const handleBulkToggleAvailability = async () => {
    try {
      const promises = Array.from(selectedItems).map(itemId => {
        const item = items.find(i => i.id === itemId)
        if (!item) return Promise.resolve()
        
        return fetch(`${PUBLIC_API_URL}/menu-manager/items/${itemId}/availability`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ isAvailable: !item.isAvailable })
        })
      })

      await Promise.all(promises)
      
      // Update state
      setItems(prevItems =>
        prevItems.map(item =>
          selectedItems.has(item.id)
            ? { ...item, isAvailable: !item.isAvailable }
            : item
        )
      )
      
      setSelectedItems(new Set())
      setBulkActionMode(false)
    } catch {
      setError('Failed to bulk toggle availability')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      return
    }

    try {
      const promises = Array.from(selectedItems).map(itemId =>
        fetch(`${PUBLIC_API_URL}/menu-manager/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
      )

      await Promise.all(promises)
      
      // Update state - filter out deleted items
      setItems(prevItems =>
        prevItems.filter(item => !selectedItems.has(item.id))
      )
      
      setSelectedItems(new Set())
      setBulkActionMode(false)
    } catch {
      setError('Failed to bulk delete items')
    }
  }

  const handleDuplicateItem = async (item: MenuItem) => {
    try {
      const duplicateData = {
        categoryId: item.categoryId,
        name: `${item.name} (Copy)`,
        description: item.description,
        price: item.price,
        displayOrder: item.displayOrder || 0,
        isAvailable: item.isAvailable,
        isSpecial: item.isSpecial,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isSpicy: item.isSpicy,
        preparationTime: item.preparationTime,
        calories: item.calories,
        allergens: item.allergens
      }

      const response = await fetch(`${PUBLIC_API_URL}/menu-manager/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(duplicateData)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add new item to state
        const newItem = {
          ...data.item,
          ...duplicateData
        }
        
        setItems(prevItems => [...prevItems, newItem])
      }
    } catch {
      setError('Failed to duplicate item')
    }
  }

  // Modal handlers
  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        categoryId: item.categoryId,
        name: item.name,
        description: item.description || '',
        price: item.price,
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable,
        isSpecial: item.isSpecial,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isSpicy: item.isSpicy,
        displayOrder: item.displayOrder,
        preparationTime: item.preparationTime,
        calories: item.calories,
        allergens: item.allergens || ''
      })
      setImagePreview(item.imageUrl || '')
      // Set selected modifier groups
      const existingGroups = item.modifierGroups?.map(mg => mg.modifierGroupId) || []
      setSelectedModifierGroups(existingGroups)
    } else {
      setEditingItem(null)
      setFormData({
        categoryId: categories[0]?.id || '',
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        isAvailable: true,
        isSpecial: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        displayOrder: items.length,
        preparationTime: undefined,
        calories: undefined,
        allergens: ''
      })
      setImagePreview('')
      setSelectedModifierGroups([])
    }
    setImageFile(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setImageFile(null)
    setImagePreview('')
    setSelectedModifierGroups([])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Filter items - only show active (not deleted) items
  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory
    const isNotDeleted = item.isActive !== false // Hide deleted items
    
    // Availability filter
    const matchesAvailability = 
      filterAvailability === 'all' ||
      (filterAvailability === 'available' && item.isAvailable) ||
      (filterAvailability === 'unavailable' && !item.isAvailable)
    
    // Dietary filter
    const matchesDietary =
      filterDietary === 'all' ||
      (filterDietary === 'vegetarian' && item.isVegetarian) ||
      (filterDietary === 'vegan' && item.isVegan) ||
      (filterDietary === 'glutenFree' && item.isGlutenFree) ||
      (filterDietary === 'spicy' && item.isSpicy) ||
      (filterDietary === 'special' && item.isSpecial)
    
    return matchesSearch && matchesCategory && isNotDeleted && matchesAvailability && matchesDietary
  })

  // Calculate statistics
  const activeItems = (items || []).filter(item => item.isActive !== false)
  const statistics = {
    total: activeItems.length,
    available: activeItems.filter(item => item.isAvailable).length,
    unavailable: activeItems.filter(item => !item.isAvailable).length,
    special: activeItems.filter(item => item.isSpecial).length,
    vegetarian: activeItems.filter(item => item.isVegetarian).length,
    vegan: activeItems.filter(item => item.isVegan).length,
    byCategory: (categories || []).map(cat => ({
      name: cat.name,
      count: activeItems.filter(item => item.categoryId === cat.id).length
    })).filter(cat => cat.count > 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
          <p className="text-sm text-gray-600">Manage your menu offerings</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
        >
          + Add Item
        </button>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total Items</p>
          <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Available</p>
          <p className="text-2xl font-bold text-green-900">{statistics.available}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium">Unavailable</p>
          <p className="text-2xl font-bold text-orange-900">{statistics.unavailable}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Special</p>
          <p className="text-2xl font-bold text-yellow-900">{statistics.special}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-sm text-emerald-600 font-medium">Vegetarian</p>
          <p className="text-2xl font-bold text-emerald-900">{statistics.vegetarian}</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-4">
          <p className="text-sm text-teal-600 font-medium">Vegan</p>
          <p className="text-2xl font-bold text-teal-900">{statistics.vegan}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {statistics.byCategory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Items by Category</p>
          <div className="flex flex-wrap gap-2">
            {statistics.byCategory.map((cat, idx) => (
              <div key={idx} className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                <span className="ml-2 text-sm text-gray-500">({cat.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {(categories || []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <select
            value={filterDietary}
            onChange={(e) => setFilterDietary(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Dietary</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="glutenFree">Gluten Free</option>
            <option value="spicy">Spicy</option>
            <option value="special">Special</option>
          </select>
        </div>

      {/* Bulk Actions Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBulkActionMode(!bulkActionMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              bulkActionMode 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {bulkActionMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
          
          {bulkActionMode && (
            <>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedItems.size > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
              )}
            </>
          )}
        </div>

        {bulkActionMode && selectedItems.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkToggleAvailability}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Toggle Availability
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className={`bg-white rounded-lg border-2 overflow-hidden relative ${!item.isAvailable ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
            {bulkActionMode && (
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleToggleItemSelection(item.id)}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            )}
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
            )}
            {!item.isAvailable && (
              <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 text-center">
                UNAVAILABLE
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                </div>
                <span className="text-lg font-bold text-indigo-600">${item.price.toFixed(2)}</span>
              </div>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.isSpecial && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⭐ Special</span>}
                {item.isVegetarian && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">🌱 Veg</span>}
                {item.isVegan && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">🌿 Vegan</span>}
                {item.isGlutenFree && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">GF</span>}
                {item.isSpicy && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">🌶️ Spicy</span>}
              </div>

              {/* Modifier Groups */}
              {item.modifierGroups && item.modifierGroups.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Modifiers:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.modifierGroups.map(mg => (
                      <span key={mg.id} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        ➕ {mg.modifierGroup?.name || 'Unknown'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2 border-t">
                <button
                  onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {item.isAvailable ? '✓ Available' : '✕ Unavailable'}
                </button>
                <button
                  onClick={() => handleDuplicateItem(item)}
                  className="px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded"
                  title="Duplicate item"
                >
                  📋
                </button>
                <button
                  onClick={() => handleOpenModal(item)}
                  className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit item"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Delete item"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-gray-600">
            {searchTerm || filterCategory !== 'all' ? 'No items match your filters' : 'No menu items yet'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Create your first item
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Item' : 'New Menu Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-start space-x-4">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    {(categories || []).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.preparationTime || ''}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Modifier Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modifier Groups</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {modifierGroups.length > 0 ? (
                    modifierGroups.map((group) => (
                      <label key={group.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedModifierGroups.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModifierGroups([...selectedModifierGroups, group.id])
                            } else {
                              setSelectedModifierGroups(selectedModifierGroups.filter(id => id !== group.id))
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{group.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No modifier groups available</p>
                  )}
                </div>
              </div>

              {/* Dietary Flags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Information</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'isSpecial', label: '⭐ Special' },
                    { key: 'isVegetarian', label: '🌱 Vegetarian' },
                    { key: 'isVegan', label: '🌿 Vegan' },
                    { key: 'isGlutenFree', label: 'Gluten-Free' },
                    { key: 'isSpicy', label: '🌶️ Spicy' },
                    { key: 'isAvailable', label: '✓ Available' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData[key as keyof MenuItemFormData] as boolean}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
