import { useState, useEffect } from 'react'

/**
 * Restaurant status data structure (matches backend API)
 */
export interface RestaurantStatus {
  isOpen: boolean
  currentStatus: 'open' | 'closed' | 'opening_soon' | 'closing_soon'
  message: string
  todayHours: {
    open: string
    close: string
    closed: boolean
  } | null
  nextOpening: {
    day: string
    date: string
    time: string
    hoursUntil: number
    minutesUntil: number
  } | null
  specialHoursToday: {
    date: string
    open?: string
    close?: string
    closed: boolean
    reason?: string
  } | null
}

/**
 * Custom hook to fetch restaurant status from API
 * Shared between RestaurantClosedPage and RestaurantClosedWithOrdersPage
 * 
 * @returns Complete restaurant status data or null if not loaded yet
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
