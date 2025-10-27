import { useState, useEffect } from 'react'
import type { Order, ApiResponse } from '../../types'

export function useOrderHistory(customerId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) {
        setError('No customer information available')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/customers/${customerId}/orders`)
        const data: ApiResponse<Order[]> = await response.json()

        if (data.success && data.data) {
          setOrders(data.data)
          setError(null)
        } else {
          setError(data.error || 'Failed to load orders')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [customerId])

  return { orders, loading, error }
}
