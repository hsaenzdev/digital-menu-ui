import React from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'

export const ManagerDashboard: React.FC = () => {
  return (
    <ManagerLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to the restaurant management system
          </p>
        </div>
      </div>
    </ManagerLayout>
  )
}
