/**
 * Customer Exists Validator
 * 
 * Validates that the customer exists in the database
 */

import type { ValidatorResult, CustomerData, ValidatorOptions } from '../types'
import { API_ENDPOINTS } from '../constants'
import { 
  validationCache, 
  getCacheKeyCustomerExists,
  fetchWithTimeout,
  parseApiResponse 
} from '../utils'

/**
 * Validate customer exists in database
 * 
 * @param customerId - Customer ID to validate
 * @param options - Validator options
 * @returns Validation result with customer data
 */
export async function validateCustomerExists(
  customerId: string,
  options?: ValidatorOptions
): Promise<ValidatorResult<CustomerData>> {
  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cacheKey = getCacheKeyCustomerExists(customerId)
    const cached = validationCache.get<ValidatorResult<CustomerData>>(cacheKey)
    
    if (cached) {
      return cached
    }
  }

  try {
    // Fetch customer from API
    const response = await fetchWithTimeout(
      `${API_ENDPOINTS.CUSTOMER}/${customerId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      options?.timeout
    )

    const data = await parseApiResponse<{ success: boolean; data?: any }>(response)

    // Check if customer exists
    if (!data.success || !data.data) {
      const result: ValidatorResult<CustomerData> = {
        passed: false,
        state: 'customer_not_found',
        error: 'Customer not found',
      }
      return result
    }

    // Customer found - cache and return success
    const result: ValidatorResult<CustomerData> = {
      passed: true,
      state: 'allowed',
      data: {
        customer: data.data,
      },
    }

    // Cache the result
    if (!options?.skipCache) {
      const cacheKey = getCacheKeyCustomerExists(customerId)
      validationCache.set(cacheKey, result)
    }

    return result

  } catch (error) {
    return {
      passed: false,
      state: 'error',
      error: error instanceof Error ? error.message : 'Failed to fetch customer',
    }
  }
}
