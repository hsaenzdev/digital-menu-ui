/**
 * Validation Constants
 * 
 * Configuration values, API endpoints, timeouts, and validation order
 */

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  CUSTOMER: '/api/customers',
  CUSTOMER_STATUS: '/api/business/customer',
  RESTAURANT_STATUS: '/api/business/status',
  GEOFENCING: '/api/geofencing/validate-delivery-zone',
} as const

// ============================================================================
// TIMEOUTS (milliseconds)
// ============================================================================

export const TIMEOUTS = {
  GEOLOCATION: 10000,           // 10 seconds for GPS gathering
  API_CALL: 5000,               // 5 seconds for API calls
  CACHE_TTL: 5 * 60 * 1000,     // 5 minutes cache TTL
} as const

// ============================================================================
// VALIDATION EXECUTION ORDER
// ============================================================================

/**
 * Order in which validations are executed
 * This order respects dependencies between validations
 */
export const VALIDATION_ORDER = [
  'customerExists',           // 1. Check if customer exists
  'customerStatus',           // 2. Check if customer is enabled
  'restaurantStatus',         // 3. Check if restaurant is open
  'geoLocationSupport',       // 4. Check browser geolocation support
  'geoLocationGather',        // 5. Gather GPS coordinates
  'geofencingValidate',       // 6. Validate delivery zone
] as const

// ============================================================================
// VALIDATION DEPENDENCIES
// ============================================================================

/**
 * Defines which validations depend on others
 * A validation can only run if its dependencies have passed
 */
export const VALIDATION_DEPS: Record<string, string[]> = {
  customerStatus: ['customerExists'],           // Needs customer to exist first
  geoLocationGather: ['geoLocationSupport'],    // Needs geolocation support
  geofencingValidate: ['geoLocationGather'],    // Needs GPS coordinates
}

// ============================================================================
// CACHEABLE VALIDATIONS
// ============================================================================

/**
 * List of validations that can be cached
 * Browser-based validations (geolocation) are not cached
 */
export const CACHEABLE_VALIDATIONS = [
  'customerExists',
  'customerStatus',
  'restaurantStatus',
  'geofencingValidate',
] as const

// ============================================================================
// GEOLOCATION OPTIONS
// ============================================================================

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,     // Request high accuracy GPS
  timeout: TIMEOUTS.GEOLOCATION,
  maximumAge: 0,                // Don't use cached position
} as const
