import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { Order, ApiResponse } from '../types'

interface UseActiveOrdersResult {
  hasActiveOrders: boolean
  activeOrders: Order[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch active orders for a customer
 * 
 * @param customerId - Optional customer ID. If not provided, will try to get from:
 *   1. URL params (:customerId)
 *   2. CustomerContext (customer.id)
 */
export const useActiveOrders = (customerId?: string): UseActiveOrdersResult => {
  const { customerId: urlCustomerId } = useParams<{ customerId: string }>()
  const { customer } = useCustomer()
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Priority: explicit param > URL param > context customer
  const resolvedCustomerId = customerId || urlCustomerId || customer?.id

  const fetchOrders = useCallback(async () => {
    if (!resolvedCustomerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${resolvedCustomerId}/orders`)
      const data: ApiResponse<Order[]> = await response.json()

      if (data.success && data.data) {
        // Filter for active orders (pending, confirmed, preparing, ready)
        const active = data.data.filter(order => 
          ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
        )
        setActiveOrders(active)
      } else {
        setError(data.error || 'Failed to load orders')
      }
    } catch {
      setError('Failed to check active orders')
    } finally {
      setLoading(false)
    }
  }, [resolvedCustomerId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    hasActiveOrders: activeOrders.length > 0,
    activeOrders,
    loading,
    error,
    refetch: fetchOrders
  }
}
