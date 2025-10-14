import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { ModifierGroup, Modifier, ModifierGroupFormData, ModifierFormData } from '../../types/menu-manager'

const API_URL = '/api/menu-manager'

export const ModifierManager: React.FC = () => {
  const [groups, setGroups] = useState<ModifierGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null)
  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null)
  const { token } = useAuth()

  const [groupFormData, setGroupFormData] = useState<ModifierGroupFormData>({
    name: '',
    description: '',
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    displayOrder: 0,
    isActive: true
  })

  const [modifierFormData, setModifierFormData] = useState<ModifierFormData>({
    modifierGroupId: '',
    name: '',
    priceAdjustment: 0,
    displayOrder: 0,
    isAvailable: true
  })

  // Fetch modifier groups
  const fetchGroups = async () => {
    if (!token) return

    try {
      setError(null)
      const response = await fetch(`${API_URL}/modifier-groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()

      if (data.success) {
        setGroups(data.groups)
      }
    } catch {
      setError('Failed to load modifier groups')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Handle group submit
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      const url = editingGroup
        ? `${API_URL}/modifier-groups/${editingGroup.id}`
        : `${API_URL}/modifier-groups`

      const response = await fetch(url, {
        method: editingGroup ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupFormData)
      })

      const data = await response.json()
      if (data.success) {
        fetchGroups()
        handleCloseGroupModal()
      }
    } catch {
      setError('Failed to save modifier group')
    }
  }

  // Handle modifier submit
  const handleModifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      const url = editingModifier
        ? `${API_URL}/modifiers/${editingModifier.id}`
        : `${API_URL}/modifiers`

      const response = await fetch(url, {
        method: editingModifier ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(modifierFormData)
      })

      const data = await response.json()
      if (data.success) {
        fetchGroups()
        handleCloseModifierModal()
      }
    } catch {
      setError('Failed to save modifier')
    }
  }

  // Delete handlers
  const handleDeleteGroup = async (id: string) => {
    if (!token || !confirm('Delete this modifier group?')) return

    try {
      await fetch(`${API_URL}/modifier-groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchGroups()
    } catch {
      setError('Failed to delete group')
    }
  }

  const handleDeleteModifier = async (id: string) => {
    if (!token || !confirm('Delete this modifier?')) return

    try {
      await fetch(`${API_URL}/modifiers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchGroups()
    } catch {
      setError('Failed to delete modifier')
    }
  }

  // Modal handlers
  const handleOpenGroupModal = (group?: ModifierGroup) => {
    if (group) {
      setEditingGroup(group)
      setGroupFormData({
        name: group.name,
        description: group.description || '',
        isRequired: group.isRequired,
        minSelection: group.minSelection,
        maxSelection: group.maxSelection || undefined,
        displayOrder: group.displayOrder,
        isActive: group.isActive
      })
    } else {
      setEditingGroup(null)
      setGroupFormData({
        name: '',
        description: '',
        isRequired: false,
        minSelection: 0,
        maxSelection: 1,
        displayOrder: groups.length,
        isActive: true
      })
    }
    setIsGroupModalOpen(true)
  }

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false)
    setEditingGroup(null)
  }

  const handleOpenModifierModal = (groupId: string, modifier?: Modifier) => {
    if (modifier) {
      setEditingModifier(modifier)
      setModifierFormData({
        modifierGroupId: modifier.modifierGroupId,
        name: modifier.name,
        priceAdjustment: modifier.priceAdjustment,
        displayOrder: modifier.displayOrder,
        isAvailable: modifier.isAvailable
      })
    } else {
      setEditingModifier(null)
      const group = groups.find(g => g.id === groupId)
      setModifierFormData({
        modifierGroupId: groupId,
        name: '',
        priceAdjustment: 0,
        displayOrder: group?.modifiers?.length || 0,
        isAvailable: true
      })
    }
    setIsModifierModalOpen(true)
  }

  const handleCloseModifierModal = () => {
    setIsModifierModalOpen(false)
    setEditingModifier(null)
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

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Modifier Groups</h2>
          <p className="text-sm text-gray-600">Manage modifiers and options</p>
        </div>
        <button
          onClick={() => handleOpenGroupModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
        >
          + Add Group
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                {group.description && <p className="text-sm text-gray-600">{group.description}</p>}
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>{group.isRequired ? '🔴 Required' : '⚪ Optional'}</span>
                  <span>Min: {group.minSelection}</span>
                  {group.maxSelection && <span>Max: {group.maxSelection}</span>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenGroupModal(group)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Modifiers</span>
                <button
                  onClick={() => handleOpenModifierModal(group.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  + Add Option
                </button>
              </div>
              <div className="space-y-2">
                {group.modifiers && group.modifiers.length > 0 ? (
                  group.modifiers.map((mod) => (
                    <div key={mod.id} className="flex justify-between items-center bg-gray-50 rounded p-2">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{mod.name}</span>
                        {mod.priceAdjustment !== 0 && (
                          <span className="text-sm text-gray-600 ml-2">
                            {mod.priceAdjustment > 0 ? '+' : ''}${mod.priceAdjustment.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModifierModal(group.id, mod)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteModifier(mod.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No modifiers yet</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">➕</div>
          <p className="text-gray-600">No modifier groups yet</p>
          <button
            onClick={() => handleOpenGroupModal()}
            className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first group
          </button>
        </div>
      )}

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingGroup ? 'Edit Group' : 'New Modifier Group'}
            </h3>
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Size, Toppings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Selection</label>
                  <input
                    type="number"
                    value={groupFormData.minSelection}
                    onChange={(e) => setGroupFormData({ ...groupFormData, minSelection: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Selection</label>
                  <input
                    type="number"
                    value={groupFormData.maxSelection || ''}
                    onChange={(e) => setGroupFormData({ ...groupFormData, maxSelection: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={groupFormData.isRequired}
                    onChange={(e) => setGroupFormData({ ...groupFormData, isRequired: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Required</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={groupFormData.isActive}
                    onChange={(e) => setGroupFormData({ ...groupFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseGroupModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  {editingGroup ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modifier Modal */}
      {isModifierModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingModifier ? 'Edit Modifier' : 'New Modifier'}
            </h3>
            <form onSubmit={handleModifierSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={modifierFormData.name}
                  onChange={(e) => setModifierFormData({ ...modifierFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Large, Extra Cheese"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Adjustment</label>
                <input
                  type="number"
                  step="0.01"
                  value={modifierFormData.priceAdjustment}
                  onChange={(e) => setModifierFormData({ ...modifierFormData, priceAdjustment: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Positive for additions, negative for discounts</p>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={modifierFormData.isAvailable}
                    onChange={(e) => setModifierFormData({ ...modifierFormData, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModifierModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  {editingModifier ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
