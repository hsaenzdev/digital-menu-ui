import React, { useState, useEffect } from 'react'
import type { MenuItem, ModifierGroup, SelectedModifier } from '../types'

interface ModifierSelectionModalProps {
  item: MenuItem
  onClose: () => void
  onAddToCart: (selectedModifiers: SelectedModifier[], specialNotes: string, quantity: number) => void
}

export const ModifierSelectionModal: React.FC<ModifierSelectionModalProps> = ({
  item,
  onClose,
  onAddToCart
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({})
  const [specialNotes, setSpecialNotes] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<string[]>([])

  // Initialize selected modifiers
  useEffect(() => {
    const initial: Record<string, string[]> = {}
    item.modifierGroups?.forEach(group => {
      initial[group.id] = []
    })
    setSelectedModifiers(initial)
  }, [item])

  const handleModifierToggle = (groupId: string, modifierId: string, group: ModifierGroup) => {
    setSelectedModifiers(prev => {
      const currentSelections = prev[groupId] || []
      const isSelected = currentSelections.includes(modifierId)

      if (isSelected) {
        // Deselect
        return {
          ...prev,
          [groupId]: currentSelections.filter(id => id !== modifierId)
        }
      } else {
        // Check max selection limit
        if (group.maxSelection && currentSelections.length >= group.maxSelection) {
          if (group.maxSelection === 1) {
            // Replace selection for single-choice groups
            return {
              ...prev,
              [groupId]: [modifierId]
            }
          }
          return prev // Already at max
        }

        // Add selection
        return {
          ...prev,
          [groupId]: [...currentSelections, modifierId]
        }
      }
    })
  }

  const calculateTotalPrice = () => {
    let total = item.price * quantity

    // Add modifier prices
    item.modifierGroups?.forEach(group => {
      const selected = selectedModifiers[group.id] || []
      selected.forEach(modifierId => {
        const modifier = group.modifiers.find(m => m.id === modifierId)
        if (modifier) {
          total += modifier.priceAdjustment * quantity
        }
      })
    })

    return total
  }

  const validateSelections = (): boolean => {
    const newErrors: string[] = []

    item.modifierGroups?.forEach(group => {
      const selected = selectedModifiers[group.id] || []

      // Check required groups
      if (group.isRequired && selected.length < group.minSelection) {
        newErrors.push(`Please select at least ${group.minSelection} option(s) for ${group.name}`)
      }

      // Check min selection
      if (group.minSelection > 0 && selected.length < group.minSelection) {
        newErrors.push(`Please select at least ${group.minSelection} option(s) for ${group.name}`)
      }

      // Check max selection
      if (group.maxSelection && selected.length > group.maxSelection) {
        newErrors.push(`Please select no more than ${group.maxSelection} option(s) for ${group.name}`)
      }
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleAddToCart = () => {
    if (!validateSelections()) {
      return
    }

    // Transform selected modifiers to the format expected by cart
    const transformedModifiers: SelectedModifier[] = item.modifierGroups
      ?.filter(group => selectedModifiers[group.id]?.length > 0)
      .map(group => ({
        modifierId: group.id,
        modifierName: group.name,
        selectedOptions: selectedModifiers[group.id].map(modId => {
          const modifier = group.modifiers.find(m => m.id === modId)!
          return {
            optionId: modifier.id,
            optionName: modifier.name,
            price: modifier.priceAdjustment
          }
        })
      })) || []

    onAddToCart(transformedModifiers, specialNotes, quantity)
    onClose()
  }

  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
          <button className="text-gray-400 hover:text-gray-600 text-2xl leading-none" onClick={onClose}>×</button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {item.description && (
            <p className="text-gray-600 mb-4">{item.description}</p>
          )}
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <span className="font-medium text-gray-900">Base Price: ${item.price.toFixed(2)}</span>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              {errors.map((error, index) => (
                <div key={index} className="text-red-700 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              ))}
            </div>
          )}

          {hasModifiers ? (
            <div className="space-y-6">
              {item.modifierGroups!.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    {group.isRequired && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Required</span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                  )}
                  <div className="text-sm text-gray-500 mb-3">
                    {group.maxSelection === 1 ? (
                      <span>Select 1 option</span>
                    ) : (
                      <span>
                        Select {group.minSelection > 0 && `${group.minSelection} to `}
                        {group.maxSelection ? group.maxSelection : 'multiple'} option(s)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.modifiers.map(modifier => {
                      const isSelected = selectedModifiers[group.id]?.includes(modifier.id)
                      const selectionType = group.maxSelection === 1 ? 'radio' : 'checkbox'

                      return (
                        <label
                          key={modifier.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type={selectionType}
                              checked={isSelected}
                              onChange={() => handleModifierToggle(group.id, modifier.id, group)}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="font-medium text-gray-900">{modifier.name}</span>
                          </div>
                          {modifier.priceAdjustment !== 0 && (
                            <span className="text-sm font-medium text-gray-700">
                              {modifier.priceAdjustment > 0 ? '+' : ''}
                              ${modifier.priceAdjustment.toFixed(2)}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No customization options available for this item.</p>
          )}

          <div className="border-t border-gray-200 pt-4 mt-4">
            <label htmlFor="special-notes" className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions:
            </label>
            <textarea
              id="special-notes"
              placeholder="Any special requests? (e.g., no onions, extra sauce)"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Quantity:</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
              >
                -
              </button>
              <span className="text-xl font-medium min-w-[3rem] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button 
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            onClick={handleAddToCart}
          >
            Add {quantity} to Cart - ${calculateTotalPrice().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
