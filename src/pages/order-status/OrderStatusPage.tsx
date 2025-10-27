import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useOrderStatus } from './useOrderStatus'
import {
  LoadingState,
  ErrorState,
  StatusCard,
  OrderDetailsCard,
  OrderItemsCard,
  OrderSummaryCard,
  PreparingNotice,
  ReadyNotice
} from './components'

export const OrderStatusPage: React.FC = () => {
  const { orderId, customerId } = useParams<{ orderId: string; customerId: string }>()
  const navigate = useNavigate()
  const { order, loading, error } = useOrderStatus(orderId)

  if (loading) {
    return <LoadingState />
  }

  if (error || !order) {
    return <ErrorState error={error || 'Order not found'} customerId={customerId || ''} />
  }

  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/${customerId}`)}
            className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} className="text-base" />
          </button>
          <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">📋 Order #{order.id}</h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-3 pb-28 space-y-3">
          {/* Current Status */}
          <StatusCard status={order.status} />

          {/* Order Details */}
          <OrderDetailsCard order={order} />

          {/* Order Items */}
          <OrderItemsCard items={order.items} />

          {/* Order Summary */}
          <OrderSummaryCard order={order} />

          {/* Status-specific notices */}
          {order.status === 'preparing' && <PreparingNotice />}
          {order.status === 'ready' && <ReadyNotice />}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-2.5 shadow-2xl z-50">
        <button
          className="w-full bg-white text-fire-600 border border-fire-500 font-semibold text-xs py-2 px-4 rounded-lg hover:bg-fire-50 transition-all"
          onClick={() => navigate(`/${customerId}/orders`)}
        >
          📋 View Order History
        </button>
      </div>
    </div>
  )
}
