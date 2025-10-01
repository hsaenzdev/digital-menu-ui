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
        console.error('Error fetching orders:', err)
        setError('Failed to load order history')
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
        return '#ffc107'
      case 'confirmed':
        return '#17a2b8'
      case 'preparing':
        return '#fd7e14'
      case 'ready':
        return '#28a745'
      case 'delivered':
        return '#6f42c1'
      case 'cancelled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const isActiveOrder = (status: string) => {
    return ['pending', 'confirmed', 'preparing', 'ready'].includes(status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <button 
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors" 
              onClick={() => navigate('/menu')}
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📋 Order History</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 text-lg">Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
        <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <button 
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors" 
              onClick={() => navigate('/menu')}
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📋 Order History</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Orders</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeOrders = orders.filter(order => isActiveOrder(order.status))
  const completedOrders = orders.filter(order => !isActiveOrder(order.status))

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-4xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <button 
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors" 
            onClick={() => navigate('/menu')}
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📋 Your Orders</h1>
          <p className="text-gray-600">Track your current and past orders</p>
        </div>

        <div className="space-y-6">
          {/* Active Orders Warning */}
          {activeOrders.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Active Orders in Progress</h3>
                <p className="text-amber-800 text-sm">
                  You have {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}. 
                  Please wait for {activeOrders.length > 1 ? 'them' : 'it'} to be completed before placing a new order.
                </p>
              </div>
            </div>
          )}

          {/* No Orders */}
          {orders.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders. Start browsing our menu!</p>
              <button 
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                onClick={() => navigate('/menu')}
              >
                Browse Menu
              </button>
            </div>
          )}

          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <span>🔥</span>
                <span>Active Orders</span>
              </h2>
              <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 font-medium">Order #</span>
                      <span className="text-lg font-bold text-gray-900">{order.orderNumber}</span>
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-white text-sm font-bold"
                      style={{ 
                        backgroundColor: getStatusColor(order.status)
                      }}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">📅 Date:</span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🍽️ Items:</span>
                      <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">💰 Total:</span>
                      <span className="total-amount">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="item-preview">
                        <span className="item-name">{item.itemName}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <button 
                    className="view-details-btn"
                    onClick={() => navigate(`/order-status/${order.id}`)}
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders Section */}
        {completedOrders.length > 0 && (
          <div className="orders-section">
            <h2>✅ Order History</h2>
            <div className="orders-list">
              {completedOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <span className="label">Order #</span>
                      <span className="value">{order.orderNumber}</span>
                    </div>
                    <div 
                      className="order-status"
                      style={{ 
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">📅 Date:</span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🍽️ Items:</span>
                      <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">💰 Total:</span>
                      <span className="total-amount">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="item-preview">
                        <span className="item-name">{item.itemName}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} more
                      </div>
                    )}
                  </div>

                  <button 
                    className="view-details-btn secondary"
                    onClick={() => navigate(`/order-status/${order.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="page-footer">
        {activeOrders.length === 0 && (
          <button 
            className="new-order-btn"
            onClick={() => navigate('/menu')}
          >
            Place New Order
          </button>
        )}
      </div>
    </div>
  )
}
