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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header with fire gradient */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-fire-500 to-ember-500 text-white flex-shrink-0">
          <h2 className="text-xl font-bold drop-shadow-md">{item.name}</h2>
          <button className="text-white hover:text-fire-100 text-3xl leading-none font-bold" onClick={onClose}>×</button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-gradient-to-b from-orange-50 to-white">
          {item.description && (
            <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
          )}
          
          <div className="bg-gradient-to-r from-fire-50 to-ember-50 border-2 border-fire-300 p-3 rounded-xl mb-4">
            <span className="font-bold text-gray-900">Base Price: <span className="text-fire-600">${item.price.toFixed(2)}</span></span>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-4 shadow-md">
              {errors.map((error, index) => (
                <div key={index} className="text-red-700 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              ))}
            </div>
          )}

          {hasModifiers ? (
            <div className="space-y-4">
              {item.modifierGroups!.map(group => (
                <div key={group.id} className="bg-white border-2 border-fire-200 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{group.name}</h3>
                    {group.isRequired && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">Required</span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                  )}
                  <div className="text-sm text-gray-500 mb-3 font-medium">
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
                          className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all shadow-sm ${
                            isSelected 
                              ? 'border-fire-500 bg-gradient-to-r from-fire-50 to-ember-50 shadow-md' 
                              : 'border-gray-200 hover:border-fire-300 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type={selectionType}
                              checked={isSelected}
                              onChange={() => handleModifierToggle(group.id, modifier.id, group)}
                              className="w-5 h-5 text-fire-600 focus:ring-fire-500 focus:ring-2"
                            />
                            <span className="font-semibold text-gray-900">{modifier.name}</span>
                          </div>
                          {modifier.priceAdjustment !== 0 && (
                            <span className="text-sm font-bold text-fire-600">
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
            <p className="text-gray-500 text-center py-4 font-medium">No customization options available for this item.</p>
          )}

          <div className="border-t-2 border-fire-200 pt-4 mt-4">
            <label htmlFor="special-notes" className="block text-sm font-bold text-gray-900 mb-2">
              Special Instructions:
            </label>
            <textarea
              id="special-notes"
              placeholder="Any special requests? (e.g., no onions, extra sauce)"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-fire-500 shadow-sm"
            />
          </div>

          <div className="border-t-2 border-fire-200 pt-4 mt-4">
            <label className="block text-sm font-bold text-gray-900 mb-3">Quantity:</label>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-fire-400 to-ember-400 hover:from-fire-500 hover:to-ember-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold text-white shadow-md transform active:scale-95 transition-all"
              >
                -
              </button>
              <span className="text-2xl font-bold min-w-[3rem] text-center text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-fire-400 to-ember-400 hover:from-fire-500 hover:to-ember-500 flex items-center justify-center text-2xl font-bold text-white shadow-md transform active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-4 border-t-2 border-fire-400 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
          <button 
            className="flex-1 px-4 py-3 border-2 border-fire-500 rounded-xl text-fire-600 font-bold hover:bg-fire-50 transition-all shadow-md transform active:scale-95" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-gradient-to-r from-fire-500 to-ember-500 text-white rounded-xl font-bold hover:from-fire-600 hover:to-ember-600 transition-all shadow-lg transform active:scale-95"
            onClick={handleAddToCart}
          >
            Add {quantity} - ${calculateTotalPrice().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
