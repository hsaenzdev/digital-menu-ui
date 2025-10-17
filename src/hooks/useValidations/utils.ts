/**
 * Validation Utilities
 * 
 * Helper functions for caching, error handling, and state management
 */

import type { ValidationState, CacheStore, ValidatorResult } from './types'
import { TIMEOUTS, CACHEABLE_VALIDATIONS } from './constants'

// ============================================================================
// CACHE MANAGER
// ============================================================================

/**
 * Simple in-memory cache for validation results
 * Supports TTL (time-to-live) expiration
 */
export class ValidationCache {
  private cache: CacheStore = {}

  /**
   * Store a value in cache with TTL
   */
  set<T>(key: string, value: T, ttl: number = TIMEOUTS.CACHE_TTL): void {
    this.cache[key] = {
      data: value,
      timestamp: Date.now(),
      ttl,
    }
  }

  /**
   * Retrieve a value from cache
   * Returns null if expired or not found
   */
  get<T>(key: string): T | null {
    const entry = this.cache[key]
    
    if (!entry) {
      return null
    }

    // Check if expired
    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      delete this.cache[key]
      return null
    }

    return entry.data as T
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Clear cache entry or entire cache
   */
  clear(key?: string): void {
    if (key) {
      delete this.cache[key]
    } else {
      this.cache = {}
    }
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(key: string): boolean {
    const entry = this.cache[key]
    if (!entry) return true

    const age = Date.now() - entry.timestamp
    return age > entry.ttl
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Object.keys(this.cache)
  }
}

// Singleton instance
export const validationCache = new ValidationCache()

// ============================================================================
// CACHE KEY GENERATORS
// ============================================================================

/**
 * Generate cache key for customer exists validation
 */
export function getCacheKeyCustomerExists(customerId: string): string {
  return `validation:customerExists:${customerId}`
}

/**
 * Generate cache key for customer status validation
 */
export function getCacheKeyCustomerStatus(customerId: string): string {
  return `validation:customerStatus:${customerId}`
}

/**
 * Generate cache key for restaurant status validation
 */
export function getCacheKeyRestaurantStatus(): string {
  return `validation:restaurantStatus`
}

/**
 * Generate cache key for geofencing validation
 */
export function getCacheKeyGeofencing(latitude: number, longitude: number): string {
  // Round to 4 decimal places (~11 meters precision) for better cache hits
  const lat = latitude.toFixed(4)
  const lon = longitude.toFixed(4)
  return `validation:geofencing:${lat},${lon}`
}

// ============================================================================
// ERROR MESSAGE HELPERS
// ============================================================================

/**
 * Get user-friendly error message for validation state
 */
export function getErrorMessage(state: ValidationState): string {
  const messages: Record<ValidationState, string> = {
    idle: '',
    loading: 'Validating...',
    customer_not_found: 'Customer not found. Please check your link.',
    customer_disabled: 'Your account has been disabled. Please contact support.',
    restaurant_closed: 'We are currently closed. Please check back later.',
    restaurant_closed_active_orders: 'We are closed for new orders, but your active order is being processed.',
    no_geolocation_support: 'Your browser does not support location services.',
    no_location_permission: 'Please enable location permission to continue.',
    outside_city: 'We do not currently deliver to your city.',
    outside_zone: 'Your location is outside our delivery zone.',
    error: 'An unexpected error occurred. Please try again.',
    allowed: '',
  }

  return messages[state] || 'Unknown error'
}

/**
 * Check if validation state should block user progress
 */
export function shouldBlockProgress(state: ValidationState): boolean {
  const blockingStates: ValidationState[] = [
    'customer_not_found',
    'customer_disabled',
    'restaurant_closed',
    'no_geolocation_support',
    'no_location_permission',
    'outside_city',
    'outside_zone',
    'error',
  ]

  return blockingStates.includes(state)
}

/**
 * Check if validation state indicates success
 */
export function isSuccessState(state: ValidationState): boolean {
  return state === 'allowed' || state === 'restaurant_closed_active_orders'
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a validation can be cached
 */
export function isCacheable(validationName: string): boolean {
  return CACHEABLE_VALIDATIONS.includes(validationName as any)
}

/**
 * Merge multiple validator results into final state
 */
export function mergeValidationData(results: Map<string, ValidatorResult>): {
  customer?: any
  restaurantStatus?: any
  location?: any
  geofencing?: any
} {
  const data: any = {}

  // Extract customer data
  const customerExistsResult = results.get('customerExists')
  if (customerExistsResult?.data) {
    data.customer = customerExistsResult.data.customer
  }

  // Extract restaurant status
  const restaurantStatusResult = results.get('restaurantStatus')
  if (restaurantStatusResult?.data) {
    data.restaurantStatus = restaurantStatusResult.data
  }

  // Extract location coordinates
  const geoLocationGatherResult = results.get('geoLocationGather')
  if (geoLocationGatherResult?.data) {
    data.location = geoLocationGatherResult.data
  }

  // Extract geofencing data
  const geofencingResult = results.get('geofencingValidate')
  if (geofencingResult?.data) {
    data.geofencing = geofencingResult.data
  }

  return data
}

/**
 * Build retry configuration from failed validation
 * Retries from the failed point, keeping previous validations
 */
export function buildRetryConfig(
  _failedValidation: string,
  originalConfig: any
): any {
  // For now, just return the original config to retry all
  // Future: Could optimize to only retry from failure point
  return {
    ...originalConfig,
    forceRefresh: true,
  }
}

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = TIMEOUTS.API_CALL
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Parse API response with error handling
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  try {
    return await response.json()
  } catch (error) {
    throw new Error('Failed to parse API response')
  }
}


