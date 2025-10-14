import React from 'react'
import { StatusBadge } from './StatusBadge'
import type { Order } from '../../types/orders'

interface OrderCardProps {
  order: Order
  onClick: (order: Order) => void
  onStatusChange?: (orderId: string, newStatus: string) => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const timeAgo = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'messenger' ? '💬' : '📱'
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div
      onClick={() => onClick(order)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getPlatformIcon(order.platform)}</span>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              #{order.orderNumber}
            </h3>
            <p className="text-xs text-gray-500">{timeAgo(order.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={order.status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'} size="sm" />
      </div>

      {/* Customer Info */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900">
          {order.customerName || 'Guest'}
        </p>
        {order.customerPhone && (
          <p className="text-xs text-gray-600">{order.customerPhone}</p>
        )}
      </div>

      {/* Items Summary */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx}>
              {item.quantity}x {item.itemName}
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-gray-400">+{order.items.length - 2} more...</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-lg font-bold text-gray-900">
          ${order.total.toFixed(2)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick(order)
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details →
        </button>
      </div>
    </div>
  )
}
