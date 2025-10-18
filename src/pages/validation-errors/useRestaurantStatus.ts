import { useState, useEffect } from 'react'

/**
 * Restaurant status data structure
 */
interface RestaurantStatus {
  isOpen: boolean
  message: string
  nextOpening?: {
    day: string
    time: string
    hoursUntil: number
    minutesUntil: number
  } | null
}

/**
 * Custom hook to fetch restaurant status
 * Shared between RestaurantClosedPage and RestaurantClosedWithOrdersPage
 * 
 * @returns Restaurant status data or null if not loaded yet
 */
export function useRestaurantStatus(): RestaurantStatus | null {
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus | null>(null)

  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const response = await fetch('/api/business/status')
        const data = await response.json()
        if (data.success && data.data) {
          setRestaurantStatus(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch restaurant status:', error)
      }
    }
    fetchRestaurantStatus()
  }, [])

  return restaurantStatus
}
