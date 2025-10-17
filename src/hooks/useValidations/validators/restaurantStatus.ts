/**
 * Restaurant Status Validator
 * 
 * Validates that the restaurant is open for orders
 * Special handling: If closed but customer has active orders, allow with warning
 */

import type { ValidatorResult, RestaurantStatusData, ValidatorOptions } from '../types'
import { API_ENDPOINTS } from '../constants'
import { 
  validationCache, 
  getCacheKeyRestaurantStatus,
  fetchWithTimeout,
  parseApiResponse 
} from '../utils'

/**
 * Validate restaurant is open
 * 
 * @param _params - Not used (restaurant status is global)
 * @param options - Validator options
 * @returns Validation result with restaurant status data
 */
export async function validateRestaurantStatus(
  _params: any,
  options?: ValidatorOptions
): Promise<ValidatorResult<RestaurantStatusData>> {
  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cacheKey = getCacheKeyRestaurantStatus()
    const cached = validationCache.get<ValidatorResult<RestaurantStatusData>>(cacheKey)
    
    if (cached) {
      return cached
    }
  }

  try {
    // Fetch restaurant status from API
    const response = await fetchWithTimeout(
      API_ENDPOINTS.RESTAURANT_STATUS,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      options?.timeout
    )

    const data = await parseApiResponse<{ 
      success: boolean
      data?: RestaurantStatusData
    }>(response)

    if (!data.success || !data.data) {
      return {
        passed: false,
        state: 'error',
        error: 'Failed to fetch restaurant status',
      }
    }

    const restaurantData = data.data

    // Check if restaurant is open
    if (!restaurantData.isOpen) {
      // Special case: If customer has active orders, allow with different state
      if (restaurantData.activeOrders && restaurantData.activeOrders.length > 0) {
        const result: ValidatorResult<RestaurantStatusData> = {
          passed: true,
          state: 'restaurant_closed_active_orders',
          data: restaurantData,
        }
        
        // Cache the result
        if (!options?.skipCache) {
          const cacheKey = getCacheKeyRestaurantStatus()
          validationCache.set(cacheKey, result)
        }
        
        return result
      }

      // Restaurant is closed and no active orders - block
      const result: ValidatorResult<RestaurantStatusData> = {
        passed: false,
        state: 'restaurant_closed',
        data: restaurantData,
        error: restaurantData.message || 'Restaurant is currently closed',
      }
      return result
    }

    // Restaurant is open - cache and return success
    const result: ValidatorResult<RestaurantStatusData> = {
      passed: true,
      state: 'allowed',
      data: restaurantData,
    }

    // Cache the result
    if (!options?.skipCache) {
      const cacheKey = getCacheKeyRestaurantStatus()
      validationCache.set(cacheKey, result)
    }

    return result

  } catch (error) {
    return {
      passed: false,
      state: 'error',
      error: error instanceof Error ? error.message : 'Failed to check restaurant status',
    }
  }
}
