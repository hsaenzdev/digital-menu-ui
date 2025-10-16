import React, { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import type { Order } from '../../types/orders'
import { useAuth } from '../../context/AuthContext'

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>
}

const statusFlow = {
  pending: { next: 'confirmed', label: 'Accept Order', color: 'bg-blue-600 hover:bg-blue-700' },
  confirmed: { next: 'preparing', label: 'Start Preparing', color: 'bg-purple-600 hover:bg-purple-700' },
  preparing: { next: 'ready', label: 'Mark as Ready', color: 'bg-green-600 hover:bg-green-700' },
  ready: { next: 'delivered', label: 'Mark as Delivered', color: 'bg-gray-600 hover:bg-gray-700' }
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const { token } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  if (!isOpen || !order) return null

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'messenger' ? '💬 Messenger' : '📱 WhatsApp'
  }

  const currentStatusFlow = statusFlow[order.status as keyof typeof statusFlow]
  const canChangeStatus = currentStatusFlow && order.status !== 'delivered' && order.status !== 'cancelled'

  const handleStatusChange = async () => {
    if (!currentStatusFlow) return
    await onStatusChange(order.id, currentStatusFlow.next)
  }

  const handleConfirmPayment = async () => {
    if (!token) return
    setIsProcessing(true)
    setPaymentError(null)

    try {
      const response = await fetch(`/api/orders-manager/orders/${order.id}/confirm-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the order by calling parent's status change handler
        // This will trigger a re-fetch of orders
        await onStatusChange(order.id, 'pending')
        onClose()
      } else {
        setPaymentError(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      setPaymentError('Failed to confirm payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectPayment = async () => {
    if (!token) return
    if (!confirm('Are you sure you want to reject this payment? This will cancel the order.')) return

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const response = await fetch(`/api/orders-manager/orders/${order.id}/reject-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the order
        await onStatusChange(order.id, 'cancelled')
        onClose()
      } else {
        setPaymentError(data.error || 'Failed to reject payment')
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
      setPaymentError('Failed to reject payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h2>
              <StatusBadge status={order.status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'} size="md" />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{order.customer?.name || 'Guest'}</p>
                <p className="text-sm text-gray-600 mt-1">{getPlatformIcon(order.customer?.platform || 'whatsapp')}</p>
                {order.customer?.whatsappNumber && (
                  <p className="text-sm text-gray-600 mt-1">📞 {order.customer.whatsappNumber}</p>
                )}
                {order.customer?.messengerPsid && (
                  <p className="text-sm text-gray-600 mt-1">💬 Messenger User</p>
                )}
                {order.customerLocation?.address && (
                  <p className="text-sm text-gray-600 mt-1">📍 {order.customerLocation.address}</p>
                )}
              </div>
            </div>

            {/* Payment Information - Show for bank transfer orders */}
            {order.paymentMethod === 'bank_transfer' && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Payment Information</h3>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🏦</span>
                      <span className="font-semibold text-gray-900">Bank Transfer</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.paymentStatus === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus === 'confirmed' ? '✓ Confirmed' : 
                       order.paymentStatus === 'failed' ? '✗ Failed' : 
                       '⏳ Pending'}
                    </span>
                  </div>
                  
                  {order.transferReference && (
                    <div className="bg-white rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Transfer Reference</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {order.transferReference}
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>💰 Amount: <span className="font-semibold">${order.total.toFixed(2)}</span></p>
                    {order.transferConfirmedAt && (
                      <p className="text-green-700">
                        ✓ Confirmed on {new Date(order.transferConfirmedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Payment error message */}
                  {paymentError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      ⚠️ {paymentError}
                    </div>
                  )}

                  {/* Payment action buttons - Only show if payment is still pending */}
                  {order.status === 'pending_payment' && order.paymentStatus === 'pending' && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : '✓ Confirm Payment'}
                      </button>
                      <button
                        onClick={handleRejectPayment}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : '✗ Reject Payment'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.itemName}
                        </p>
                        <p className="text-sm text-gray-600">${item.itemPrice.toFixed(2)} each</p>
                      </div>
                      <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                    </div>
                    
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-300">
                        <p className="text-xs text-gray-500 mb-1">Modifiers:</p>
                        {item.selectedModifiers.map((mod, modIdx) => (
                          <div key={modIdx}>
                            {mod.selectedOptions && mod.selectedOptions.map((option, optIdx) => (
                              <p key={optIdx} className="text-sm text-gray-700">
                                + {option.optionName}
                                {option.price > 0 && ` (+$${option.price.toFixed(2)})`}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {item.specialNotes && (
                      <div className="mt-2 pl-4 border-l-2 border-yellow-400">
                        <p className="text-xs text-gray-500 mb-1">Special Notes:</p>
                        <p className="text-sm text-gray-700">{item.specialNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                  </div>
                )}
                {order.tip > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tip</span>
                    <span className="text-gray-900">${order.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mb-6 text-xs text-gray-500">
              <p>Created: {formatTime(order.createdAt)}</p>
              <p>Updated: {formatTime(order.updatedAt)}</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            {canChangeStatus && (
              <button
                onClick={handleStatusChange}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${currentStatusFlow.color}`}
              >
                {currentStatusFlow.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
