import React from 'react'
import { ManagerSidebar } from './ManagerSidebar'

interface ManagerLayoutProps {
  children: React.ReactNode
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <ManagerSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Restaurant Manager
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
