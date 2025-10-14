import React, { useState, useEffect } from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'
import { OrderCard } from '../../components/orders/OrderCard'
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal'
import { useAuth } from '../../context/AuthContext'
import type { Order, OrderStatus } from '../../types/orders'

// Configuration constants
const API_URL = 'http://localhost:3000/api/orders-manager'
const AUTO_REFRESH_INTERVAL = 30000 // 30 seconds
const STATUS_UPDATE_DEBOUNCE = 1000 // 1 second delay after status change before refreshing

const KANBAN_COLUMNS: Array<{ status: OrderStatus; title: string; icon: string; color: string }> = [
  { status: 'pending', title: 'New Orders', icon: '🔔', color: 'border-yellow-300 bg-yellow-50' },
  { status: 'confirmed', title: 'Confirmed', icon: '✅', color: 'border-blue-300 bg-blue-50' },
  { status: 'preparing', title: 'In Kitchen', icon: '🍳', color: 'border-purple-300 bg-purple-50' },
  { status: 'ready', title: 'Ready', icon: '📦', color: 'border-green-300 bg-green-50' }
]

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  // Fetch orders
  const fetchOrders = async (isManualRefresh = false) => {
    if (!token) return

    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      }
      setError(null) // Clear previous errors
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
        setLastUpdate(new Date())
      } else {
        setError(data.error || 'Failed to load orders')
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setError('Unable to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Auto-refresh at regular intervals
  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state optimistically
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        
        // Close modal if open
        if (selectedOrder?.id === orderId) {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }

        // Refresh orders after a short delay to get latest data from server
        setTimeout(() => {
          fetchOrders()
        }, STATUS_UPDATE_DEBOUNCE)
      } else {
        setError(data.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      setError('Failed to update order status. Please try again.')
    }
  }

  // Open order details
  const handleOrderClick = async (order: Order) => {
    if (!token) return

    try {
      // Fetch full order details to ensure we have parsed modifiers
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setSelectedOrder(data.order)
        setIsModalOpen(true)
      } else {
        // Fallback to list order if fetch fails
        setSelectedOrder(order)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      // Fallback to list order
      setSelectedOrder(order)
      setIsModalOpen(true)
    }
  }

  // Get orders by status
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status)
  }

  if (isLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="h-full flex flex-col">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Board</h1>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
          {KANBAN_COLUMNS.map(column => {
            const columnOrders = getOrdersByStatus(column.status)
            return (
              <div key={column.status} className="flex flex-col min-h-0">
                {/* Column Header */}
                <div className={`rounded-t-lg border-2 ${column.color} p-3 mb-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{column.icon}</span>
                      <h2 className="font-semibold text-gray-900">{column.title}</h2>
                    </div>
                    <span className="bg-white rounded-full px-2 py-1 text-sm font-bold text-gray-700">
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnOrders.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No orders
                    </div>
                  ) : (
                    columnOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onClick={handleOrderClick}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
        onStatusChange={handleStatusChange}
      />
    </ManagerLayout>
  )
}
