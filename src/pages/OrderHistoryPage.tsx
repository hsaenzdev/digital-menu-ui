import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { Order, ApiResponse } from '../types'

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer } = useCustomer()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer?.id) {
        setError('No customer information available')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/customers/${customer.id}/orders`)
        const data: ApiResponse<Order[]> = await response.json()

        if (data.success && data.data) {
          setOrders(data.data)
        } else {
          setError(data.error || 'Failed to load orders')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [customer?.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '🔔'
      case 'delivered':
        return '🎉'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'confirmed':
        return 'text-blue-600 bg-blue-50'
      case 'preparing':
        return 'text-orange-600 bg-orange-50'
      case 'ready':
        return 'text-green-600 bg-green-50'
      case 'delivered':
        return 'text-purple-600 bg-purple-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Order History</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">Loading your orders...</p>
          </div>
          
          {/* Loading Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-600">Loading your order history...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-center">📋 Order History</h1>
            <p className="text-purple-100 text-xs sm:text-sm md:text-base text-center">Error loading orders</p>
          </div>
          
          {/* Error Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Orders</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-card hover:shadow-card-hover"
                onClick={() => navigate('/menu')}
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button 
              className="text-white hover:text-purple-100 font-medium flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/menu')}
            >
              ← <span className="hidden xs:inline">Back</span>
            </button>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">📋 Order History</h1>
              <p className="text-purple-100 text-xs sm:text-sm md:text-base">Your past orders</p>
            </div>
            <div className="w-8"></div> {/* Spacer for centering */}
          </div>

          {/* Customer Summary */}
          {customer && (
            <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 text-xs sm:text-sm text-purple-100 mt-3 pt-3 border-t border-purple-400">
              <span className="flex items-center gap-1 truncate">
                👤 <span className="truncate">{customer.name}</span>
              </span>
              <span className="flex items-center gap-1 truncate">
                📞 <span className="truncate">{customer.phoneNumber}</span>
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="p-4 sm:p-6 pb-24 space-y-6"> {/* Bottom padding for sticky button */}

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-7xl mb-4">📋</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
                <p className="text-gray-600 mb-6">You haven't placed any orders. Start browsing our menu!</p>
                <button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all"
                  onClick={() => navigate('/menu')}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Your Orders ({orders.length})</h2>
                
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">Order #{order.orderNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</div>
                          <div>📍 {order.location}</div>
                          <div>💰 ${order.total.toFixed(2)} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      
                      <button 
                        className="ml-4 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/order-status/${order.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                    
                    {/* Order Items Preview */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.quantity}x {item.itemName}
                            </span>
                            <span className="text-gray-900 font-medium">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-gray-500 italic">
                            +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="flex-1 bg-white text-purple-600 border border-purple-600 text-sm px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                        onClick={() => navigate(`/order-status/${order.id}`)}
                      >
                        📋 View Status
                      </button>
                      
                      {order.status === 'delivered' && (
                        <button 
                          className="flex-1 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                          onClick={() => {
                            // TODO: Implement reorder functionality
                            navigate('/menu')
                          }}
                        >
                          🔄 Reorder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 rounded-b-3xl">
          <button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate('/menu')}
          >
            Browse Menu
          </button>
        </div>
      </div>
    </div>
  )
}