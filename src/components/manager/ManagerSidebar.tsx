import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/manager', icon: '📊', label: 'Dashboard' },
  { path: '/manager/orders', icon: '📦', label: 'Orders' },
  { path: '/manager/menu', icon: '🍽️', label: 'Menu' },
  { path: '/manager/customers', icon: '👥', label: 'Customers' },
  { path: '/manager/zones', icon: '🗺️', label: 'Delivery Zones' },
  { path: '/manager/analytics', icon: '📈', label: 'Analytics' },
  { path: '/manager/settings', icon: '⚙️', label: 'Settings' },
]

export const ManagerSidebar: React.FC = () => {
  const location = useLocation()
  const { logout, staff } = useAuth()

  const isActive = (path: string) => {
    if (path === '/manager') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🔥</div>
          <div>
            <h1 className="text-xl font-bold">La Brasita</h1>
            <p className="text-xs text-gray-400">Manager Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {staff && (
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm text-gray-300 font-medium">{staff.firstName} {staff.lastName}</p>
            <p className="text-xs text-gray-500">{staff.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
