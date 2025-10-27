import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order } from '../../types'

export function useOrderCancellation(order: Order | null, customerId: string | undefined) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleCancelOrderClick = () => {
    if (!order) return

    // Validate if payment was already confirmed
    if (order.paymentStatus === 'confirmed') {
      setCancelError('Payment has already been confirmed. You cannot cancel this order anymore.')
      return
    }

    // Validate if order was already accepted by staff (status moved from pending_payment)
    if (order.status !== 'pending_payment') {
      setCancelError('This order has already been accepted by the restaurant. You cannot cancel it anymore.')
      return
    }

    // Show confirmation modal
    setCancelError(null)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (!order?.id) return

    setIsCancelling(true)
    setCancelError(null)

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'PATCH'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Successfully cancelled - redirect to welcome page
        setShowCancelModal(false)
        navigate(`/${customerId}`)
      } else {
        // Handle specific error cases
        if (data.error?.includes('status')) {
          setCancelError('This order cannot be cancelled at this stage.')
        } else {
          setCancelError(data.error || 'Failed to cancel order. Please try again.')
        }
      }
    } catch {
      setCancelError('Failed to cancel order. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCloseCancelModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false)
    }
  }

  return {
    isCancelling,
    showCancelModal,
    cancelError,
    handleCancelOrderClick,
    handleConfirmCancel,
    handleCloseCancelModal
  }
}
