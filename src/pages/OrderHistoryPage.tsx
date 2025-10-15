import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { Order, ApiResponse } from '../types'

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order History</h1>
          <p className="text-fire-100 text-sm mt-1 text-center">Loading your orders...</p>
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-12">
            <div className="text-7xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 font-medium text-lg">Loading your order history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order History</h1>
          <p className="text-fire-100 text-sm mt-1 text-center">Error loading orders</p>
        </div>
        
        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-12 px-4">
            <div className="text-8xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Failed to Load Orders</h3>
            <p className="text-gray-600 mb-6 text-lg font-medium">{error}</p>
            <button 
              className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
              onClick={() => navigate(`/${customerId}/menu`)}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors"
            onClick={() => navigate(`/${customerId}/menu`)}
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md text-center">📋 Order History</h1>
        <p className="text-fire-100 text-sm mt-1 text-center">Your past orders</p>

        {/* Customer Summary */}
        {customer && (
          <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 text-xs sm:text-sm text-fire-100 mt-3 pt-3 border-t border-fire-400">
            <span className="flex items-center gap-1 truncate">
              👤 <span className="truncate font-medium">{customer.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-32 space-y-6"> {/* Bottom padding for sticky button */}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6 text-lg">You haven't placed any orders. Start browsing our menu!</p>
              <button 
                className="bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
                onClick={() => navigate(`/${customerId}/menu`)}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Your Orders ({orders.length})</h2>
              
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fire-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Order #{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 font-medium">
                        <div>📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</div>
                        <div>📍 {order.customerLocation?.address || 'Address not available'}</div>
                        <div className="font-bold text-fire-600">💰 ${order.total.toFixed(2)} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    
                    <button 
                      className="ml-4 bg-gradient-to-r from-fire-500 to-ember-500 hover:from-fire-600 hover:to-ember-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-md transform active:scale-95"
                      onClick={() => navigate(`/${customerId}/order-status/${order.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="bg-gradient-to-r from-fire-50 to-ember-50 rounded-xl p-4 border border-fire-200">
                    <h4 className="font-bold text-gray-900 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">
                            {item.quantity}x {item.itemName}
                          </span>
                          <span className="text-gray-900 font-bold">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-500 italic font-medium">
                          +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <button 
                      className="flex-1 bg-white text-fire-600 border-2 border-fire-500 text-sm font-bold px-4 py-2 rounded-lg hover:bg-fire-50 transition-all shadow-md"
                      onClick={() => navigate(`/${customerId}/order-status/${order.id}`)}
                    >
                      📋 View Status
                    </button>
                    
                    {order.status === 'delivered' && (
                      <button 
                        className="flex-1 bg-gradient-to-r from-fire-500 to-ember-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:from-fire-600 hover:to-ember-600 transition-all shadow-md transform active:scale-95"
                        onClick={() => navigate(`/${customerId}/menu`)}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
        <button 
          className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
          onClick={() => navigate(`/${customerId}/menu`)}
        >
          Browse Menu
        </button>
      </div>
    </div>
  )
}