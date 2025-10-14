import React from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'

export const MenuManager: React.FC = () => {
  return (
    <ManagerLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Menu Manager
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Create, edit, and manage menu items
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-green-800 text-sm">
              <strong>Phase 4:</strong> Menu management functionality will be implemented after orders manager
            </p>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
