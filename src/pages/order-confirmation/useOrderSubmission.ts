import { useState } from 'react'
import type { Order, PaymentMethod, ApiResponse, Cart } from '../../types'

interface UseOrderSubmissionOptions {
  onSuccess?: (order: Order, paymentMethod: PaymentMethod) => void
}

export function useOrderSubmission(options: UseOrderSubmissionOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitOrder = async (
    cart: Cart,
    customerId: string,
    customerLocationId: string,
    paymentMethod: PaymentMethod
  ) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const total = cart.subtotal + cart.tax + cart.tip

      const orderData = {
        customerId,
        customerLocationId,
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        tip: cart.tip,
        total,
        paymentMethod
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result: ApiResponse<Order> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit order')
      }

      setSubmittedOrder(result.data!)
      options.onSuccess?.(result.data!, paymentMethod)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitOrder,
    submittedOrder,
    isSubmitting,
    error
  }
}
