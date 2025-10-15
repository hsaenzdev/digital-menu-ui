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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-fire-600 to-ember-600 text-white flex-shrink-0">
          <h2 className="text-lg font-bold drop-shadow-md">{item.name}</h2>
          <button className="text-white hover:text-fire-100 text-2xl leading-none font-bold" onClick={onClose}>×</button>
        </div>

        <div className="p-3 overflow-y-auto flex-1 bg-gradient-to-b from-orange-50 to-white">
          {item.description && (
            <p className="text-gray-600 mb-2.5 text-sm leading-relaxed">{item.description}</p>
          )}
          
          <div className="bg-gradient-to-r from-fire-50 to-ember-50 border border-fire-300 p-2 rounded-lg mb-2.5">
            <span className="font-bold text-gray-900 text-sm">Base Price: <span className="text-fire-600">${item.price.toFixed(2)}</span></span>
          </div>

          {/* Quantity Selector - Compact */}
          <div className="bg-white border border-fire-400 rounded-lg p-2.5 mb-2.5 shadow-sm">
            <label className="block text-center text-xs font-bold text-gray-900 mb-2">Quantity</label>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-fire-500 to-ember-500 hover:from-fire-600 hover:to-ember-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold text-white shadow-md transition-all"
              >
                -
              </button>
              <span className="text-2xl font-bold min-w-[3rem] text-center text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-fire-500 to-ember-500 hover:from-fire-600 hover:to-ember-600 flex items-center justify-center text-xl font-bold text-white shadow-md transition-all"
              >
                +
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-2 mb-2.5 shadow-sm">
              {errors.map((error, index) => (
                <div key={index} className="text-red-700 text-xs flex items-center gap-1.5">
                  <span>⚠️</span> {error}
                </div>
              ))}
            </div>
          )}

          {hasModifiers ? (
            <div className="space-y-2.5">
              {item.modifierGroups!.map(group => (
                <div key={group.id} className="bg-white border border-fire-200 rounded-lg p-2.5 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-gray-900 text-sm">{group.name}</h3>
                    {group.isRequired && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">Required</span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-gray-600 text-xs mb-2">{group.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mb-2 font-medium">
                    {group.maxSelection === 1 ? (
                      <span>Select 1 option</span>
                    ) : (
                      <span>
                        Select {group.minSelection > 0 && `${group.minSelection} to `}
                        {group.maxSelection ? group.maxSelection : 'multiple'} option(s)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {group.modifiers.map(modifier => {
                      const isSelected = selectedModifiers[group.id]?.includes(modifier.id)
                      const selectionType = group.maxSelection === 1 ? 'radio' : 'checkbox'

                      return (
                        <label
                          key={modifier.id}
                          className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-all shadow-sm ${
                            isSelected 
                              ? 'border-fire-500 bg-gradient-to-r from-fire-50 to-ember-50' 
                              : 'border-gray-200 hover:border-fire-300 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type={selectionType}
                              checked={isSelected}
                              onChange={() => handleModifierToggle(group.id, modifier.id, group)}
                              className="w-4 h-4 text-fire-600 focus:ring-fire-500 focus:ring-1"
                            />
                            <span className="font-semibold text-gray-900 text-sm">{modifier.name}</span>
                          </div>
                          {modifier.priceAdjustment !== 0 && (
                            <span className="text-xs font-bold text-fire-600">
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
            <p className="text-gray-500 text-center py-3 font-medium text-sm">No customization options available.</p>
          )}

          <div className="border-t border-fire-200 pt-2.5 mt-2.5">
            <label htmlFor="special-notes" className="block text-xs font-bold text-gray-900 mb-1.5">
              Special Instructions:
            </label>
            <textarea
              id="special-notes"
              placeholder="Any special requests? (e.g., no onions, extra sauce)"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              rows={2}
              className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-fire-500 shadow-sm text-sm"
            />
          </div>
        </div>

        <div className="flex space-x-2 p-2.5 border-t border-fire-400 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
          <button 
            className="flex-1 px-3 py-2 border border-fire-500 rounded-lg text-fire-600 font-semibold hover:bg-fire-50 transition-all shadow-sm text-sm" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-3 py-2 bg-gradient-to-r from-fire-600 to-ember-600 text-white rounded-lg font-semibold hover:from-fire-700 hover:to-ember-700 transition-all shadow-lg text-sm"
            onClick={handleAddToCart}
          >
            Add {quantity} - ${calculateTotalPrice().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}
