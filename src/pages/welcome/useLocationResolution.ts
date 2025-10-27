import { useState, useCallback } from 'react'
import type { LocationData } from '../../types'

/**
 * Hook to handle customer location resolution
 * 
 * Resolves GPS coordinates to:
 * - Save/update customer_location in database
 * - Get existing address if location already exists
 * - Return location ID for later updates
 * 
 * Separate from geofencing validation (which checks city/zone)
 * This is business logic for saving location data
 * 
 * @param customerId - Customer ID for location resolution
 * @returns Location resolution state and handler
 */
export function useLocationResolution(customerId: string | undefined) {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [resolvedLocationId, setResolvedLocationId] = useState<string | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState<string>('')

  /**
   * Resolve location coordinates to address and save to database
   * 
   * @param latitude - GPS latitude
   * @param longitude - GPS longitude
   * @returns Resolved location data including ID and address
   */
  const resolveLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!customerId) {
      setError('No customer ID available')
      return null
    }
    
    setIsResolving(true)
    setError('')

    try {
      const response = await fetch(
        `/api/customers/${customerId}/locations/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude })
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.location) {
          const location: LocationData = {
            latitude,
            longitude,
            address: data.location.address || ''
          }
          
          setLocationData(location)
          setResolvedLocationId(data.location.id)
          
          // Clear error if location exists with address
          if (data.location.isExisting && data.location.address) {
            setError('')
          } else if (!data.location.address) {
            setError('GPS saved! Please enter your delivery address.')
          }
          
          return {
            location,
            locationId: data.location.id,
            address: data.location.address || '',
            isExisting: data.location.isExisting
          }
        }
      }
      
      setError('Please enter your address manually.')
      return null
    } catch (err) {
      setError('Please enter your address manually.')
      return null
    } finally {
      setIsResolving(false)
    }
  }, [customerId])

  /**
   * Update the address for an existing location
   * 
   * @param address - New address string
   */
  const updateAddress = (address: string) => {
    if (locationData) {
      setLocationData({
        ...locationData,
        address
      })
    } else {
      // Create location data without GPS coordinates
      setLocationData({
        latitude: 0,
        longitude: 0,
        address
      })
    }
  }

  /**
   * Save address to database for existing location
   * 
   * @param address - Address to save
   * @returns Success status
   */
  const saveAddress = async (address: string): Promise<boolean> => {
    if (!customerId || !resolvedLocationId) {
      return false
    }

    try {
      const response = await fetch(
        `/api/customers/${customerId}/locations/${resolvedLocationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }
      )

      return response.ok
    } catch {
      return false
    }
  }

  return {
    /** Current location data (coordinates + address) */
    locationData,
    /** Database ID of resolved location */
    resolvedLocationId,
    /** Whether location resolution is in progress */
    isResolving,
    /** Error message from resolution */
    error,
    /** Resolve GPS coordinates to location */
    resolveLocation,
    /** Update address in state */
    updateAddress,
    /** Save address to database */
    saveAddress
  }
}
