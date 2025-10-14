import React from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'

export const DeliveryZonesManager: React.FC = () => {
  return (
    <ManagerLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Delivery Zones Manager
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage delivery zones
          </p>
        </div>
      </div>
    </ManagerLayout>
  )
}
