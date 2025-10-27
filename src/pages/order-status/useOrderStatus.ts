import { useState, useEffect } from 'react'
import type { Order, ApiResponse } from '../../types'

export function useOrderStatus(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const result: ApiResponse<Order> = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch order')
        }

        setOrder(result.data!)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [orderId])

  return { order, loading, error }
}
