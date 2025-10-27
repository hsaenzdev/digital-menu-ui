/**
 * Geofencing Validator
 * 
 * Validates customer location is within city boundaries and delivery zone
 */

import type { ValidatorResult, GeofencingData, LocationCoordinates, ValidatorOptions, ValidatorContext } from '../types'
import { API_ENDPOINTS } from '../constants'
import { 
  validationCache, 
  getCacheKeyGeofencing,
  fetchWithTimeout,
  parseApiResponse 
} from '../utils'

/**
 * Validate customer is within delivery zone
 * 
 * @param context - Validator context (expects geoLocationGather data)
 * @param options - Validator options
 * @returns Validation result with city/zone data
 */
export async function validateGeofencingValidate(
  context: ValidatorContext,
  options?: ValidatorOptions
): Promise<ValidatorResult<GeofencingData>> {
  // Extract GPS coordinates from accumulated data
  const coordinates = context.data.geoLocationGather as LocationCoordinates | undefined
  
  if (!coordinates) {
    return {
      passed: false,
      state: 'error',
      error: 'GPS coordinates not available. Run geoLocationGather first.',
    }
  }

  const { latitude, longitude } = coordinates

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cacheKey = getCacheKeyGeofencing(latitude, longitude)
    const cached = validationCache.get<ValidatorResult<GeofencingData>>(cacheKey)
    
    if (cached) {
      return cached
    }
  }

  try {
    // Validate delivery zone via API
    const response = await fetchWithTimeout(
      API_ENDPOINTS.GEOFENCING,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      },
      options?.timeout
    )

    const data = await parseApiResponse<{ 
      success: boolean
      isValid?: boolean
      withinDeliveryZone?: boolean
      data?: {
        reason: string
        message: string
        city: { id: string; name: string } | null
        zone: { id: string; name: string; description?: string } | null
      }
    }>(response)

    if (!data.success) {
      return {
        passed: false,
        state: 'error',
        error: 'Failed to validate delivery zone',
      }
    }

    // Check if location is valid and within delivery zone
    if (data.withinDeliveryZone) {
      const result: ValidatorResult<GeofencingData> = {
        passed: true,
        state: 'allowed',
        data: {
          city: data.data?.city || null,
          zone: data.data?.zone || null,
          reason: data.data?.reason,
          message: data.data?.message,
        },
      }

      // Cache the result
      if (!options?.skipCache) {
        const cacheKey = getCacheKeyGeofencing(latitude, longitude)
        validationCache.set(cacheKey, result)
      }

      return result
    }

    // Determine if it's a city issue or zone issue
    const reason = data.data?.reason || ''
    const isOutsideCity = reason === 'CITY_NOT_FOUND' || reason === 'OUTSIDE_CITY'

    const result: ValidatorResult<GeofencingData> = {
      passed: false,
      state: isOutsideCity ? 'outside_city' : 'outside_zone',
      data: {
        city: data.data?.city || null,
        zone: data.data?.zone || null,
        reason: data.data?.reason,
        message: data.data?.message,
      },
      error: data.data?.message || (isOutsideCity ? 'Outside city boundaries' : 'Outside delivery zone'),
    }

    return result

  } catch (error) {
    return {
      passed: false,
      state: 'error',
      error: error instanceof Error ? error.message : 'Failed to validate delivery zone',
    }
  }
}
