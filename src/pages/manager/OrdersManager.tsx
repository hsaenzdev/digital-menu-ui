import React from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'

export const OrdersManager: React.FC = () => {
  return (
    <ManagerLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Orders Manager
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Manage active orders, accept, prepare, and deliver
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              <strong>Phase 3:</strong> Order management functionality will be implemented after authentication
            </p>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
