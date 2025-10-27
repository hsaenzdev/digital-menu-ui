import { useEffect, useState } from 'react'
import type { Order, ApiResponse } from '../../types'

/**
 * Hook to detect active orders for a customer
 * 
 * Active orders are orders with status: pending, confirmed, preparing, or ready
 * Used to:
 * - Show active orders banner
 * - Enable "Track Order" button
 * - Pass to restaurant-closed validation for special UI
 * - Block new order submissions (business logic, not validation)
 * 
 * @param customerId - Customer ID to check for active orders
 * @returns Active order detection state
 */
export function useActiveOrderDetection(customerId: string | undefined) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkActiveOrders = async () => {
      if (!customerId) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError('')
        
        const response = await fetch(`/api/customers/${customerId}/orders`)
        const data: ApiResponse<Order[]> = await response.json()

        if (data.success && data.data) {
          // Find active orders (pending, confirmed, preparing, ready)
          const active = data.data.filter(order => 
            ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
          )
          
          setActiveOrders(active)
          // Set first active order (for restaurant-closed state)
          setActiveOrder(active.length > 0 ? active[0] : null)
        } else {
          setActiveOrders([])
          setActiveOrder(null)
        }
      } catch (err) {
        setError('Failed to check active orders')
        setActiveOrders([])
        setActiveOrder(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkActiveOrders()
  }, [customerId])

  return {
    /** First active order (for passing to validations) */
    activeOrder,
    /** All active orders */
    activeOrders,
    /** Whether there are any active orders */
    hasActiveOrders: activeOrders.length > 0,
    /** Number of active orders */
    activeOrderCount: activeOrders.length,
    /** Loading state */
    isLoading,
    /** Error message if fetch failed */
    error
  }
}
