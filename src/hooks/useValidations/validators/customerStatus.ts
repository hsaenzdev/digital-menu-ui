/**
 * Customer Status Validator
 * 
 * Validates that the customer account is not disabled
 */

import type { ValidatorResult, ValidatorOptions, ValidatorContext } from '../types'
import { API_ENDPOINTS } from '../constants'
import { 
  validationCache, 
  getCacheKeyCustomerStatus,
  fetchWithTimeout,
  parseApiResponse 
} from '../utils'

/**
 * Validate customer is not disabled
 * 
 * @param context - Validator context (contains customerId)
 * @param options - Validator options
 * @returns Validation result
 */
export async function validateCustomerStatus(
  context: ValidatorContext,
  options?: ValidatorOptions
): Promise<ValidatorResult<void>> {
  const customerId = context.customerId

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cacheKey = getCacheKeyCustomerStatus(customerId)
    const cached = validationCache.get<ValidatorResult<void>>(cacheKey)
    
    if (cached) {
      return cached
    }
  }

  try {
    // Fetch customer status from API
    const response = await fetchWithTimeout(
      `${API_ENDPOINTS.CUSTOMER_STATUS}/${customerId}/status`,
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
      data?: { canOrder: boolean }
    }>(response)

    // Check if customer can order
    if (!data.success || !data.data?.canOrder) {
      const result: ValidatorResult<void> = {
        passed: false,
        state: 'customer_disabled',
        error: 'Customer account is disabled',
      }
      return result
    }

    // Customer is active - cache and return success
    const result: ValidatorResult<void> = {
      passed: true,
      state: 'allowed',
    }

    // Cache the result
    if (!options?.skipCache) {
      const cacheKey = getCacheKeyCustomerStatus(customerId)
      validationCache.set(cacheKey, result)
    }

    return result

  } catch (error) {
    return {
      passed: false,
      state: 'error',
      error: error instanceof Error ? error.message : 'Failed to check customer status',
    }
  }
}
