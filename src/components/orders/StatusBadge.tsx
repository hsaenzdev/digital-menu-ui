import React from 'react'

type OrderStatus = 'pending_payment' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

interface StatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<OrderStatus, { label: string; colors: string }> = {
  pending_payment: {
    label: 'Awaiting Payment',
    colors: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  pending: {
    label: 'New Order',
    colors: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  confirmed: {
    label: 'Confirmed',
    colors: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  preparing: {
    label: 'In Kitchen',
    colors: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  ready: {
    label: 'Ready',
    colors: 'bg-green-100 text-green-800 border-green-300'
  },
  delivered: {
    label: 'Delivered',
    colors: 'bg-gray-100 text-gray-800 border-gray-300'
  },
  cancelled: {
    label: 'Cancelled',
    colors: 'bg-red-100 text-red-800 border-red-300'
  }
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-semibold
        ${config.colors}
        ${sizeClasses[size]}
      `}
    >
      {config.label}
    </span>
  )
}
