import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { useCustomer } from '../../context/CustomerContext'
import { useOrderHistory } from './useOrderHistory'
import { LoadingState, ErrorState, EmptyState, OrderCard } from './components'

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { customer } = useCustomer()
  const { orders, loading, error } = useOrderHistory(customer?.id)

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} customerId={customerId || ''} />
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
          <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">📋 Order History</h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-3 pb-20 space-y-3">
          {/* Empty State */}
          {orders.length === 0 && <EmptyState customerId={customerId || ''} />}

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-gray-900">Your Orders ({orders.length})</h2>

              {orders.map((order) => (
                <OrderCard key={order.id} order={order} customerId={customerId || ''} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
