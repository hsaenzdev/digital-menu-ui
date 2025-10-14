import React, { useState } from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'
import { CategoryManager } from '../../components/menu-manager/CategoryManager'
import { ItemManager } from '../../components/menu-manager/ItemManager'
import { ModifierManager } from '../../components/menu-manager/ModifierManager'

type Tab = 'items' | 'categories' | 'modifiers'

export const MenuManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('items')

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'items', label: 'Menu Items', icon: '🍽️' },
    { id: 'categories', label: 'Categories', icon: '📂' },
    { id: 'modifiers', label: 'Modifiers', icon: '➕' }
  ]

  return (
    <ManagerLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your menu items, categories, and modifiers
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'items' && <ItemManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'modifiers' && <ModifierManager />}
        </div>
      </div>
    </ManagerLayout>
  )
}
