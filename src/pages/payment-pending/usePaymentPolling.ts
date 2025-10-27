import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order, ApiResponse } from '../../types'

export function usePaymentPolling(orderId: string | undefined, customerId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Initial fetch
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const orderData: ApiResponse<Order> = await response.json()

        if (orderData.success && orderData.data) {
          setOrder(orderData.data)

          // If payment already confirmed, redirect to order status
          if (orderData.data.paymentStatus === 'confirmed') {
            navigate(`/${customerId}/order-status/${orderId}`)
            return
          }

          // If order cancelled, redirect to menu
          if (orderData.data.status === 'cancelled') {
            navigate(`/${customerId}/menu`)
            return
          }
        } else {
          setError(orderData.error || 'Order not found')
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, customerId, navigate])

  // Poll for payment status updates every 10 seconds
  useEffect(() => {
    if (!orderId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data: ApiResponse<Order> = await response.json()
          if (data.success && data.data) {
            // Payment confirmed - redirect to order status
            if (data.data.paymentStatus === 'confirmed') {
              navigate(`/${customerId}/order-status/${orderId}`)
              return
            }

            // Order cancelled - redirect to menu
            if (data.data.status === 'cancelled') {
              navigate(`/${customerId}/menu`)
              return
            }

            setOrder(data.data)
          }
        }
      } catch {
        // Silently fail - will retry on next poll
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [orderId, customerId, navigate])

  return { order, loading, error }
}
