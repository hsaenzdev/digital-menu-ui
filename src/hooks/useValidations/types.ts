/**
 * Validation Types
 * 
 * Type definitions for the validation framework
 */

import type { Customer } from '../../types'

// ============================================================================
// VALIDATION STATES
// ============================================================================

/**
 * All possible validation states
 * Each state represents a specific validation failure or success point
 */
export type ValidationState = 
  | 'idle'                              // Initial state before validation starts
  | 'loading'                           // Validation in progress
  | 'customer_not_found'                // Customer ID doesn't exist
  | 'customer_disabled'                 // Customer account is disabled
  | 'restaurant_closed'                 // Restaurant is closed, no active orders
  | 'restaurant_closed_active_orders'   // Restaurant closed but customer has active orders
  | 'no_geolocation_support'            // Browser doesn't support geolocation
  | 'no_location_permission'            // User denied location permission or error
  | 'outside_city'                      // Customer location is outside city boundaries
  | 'outside_zone'                      // Customer location is outside delivery zone
  | 'error'                             // Unexpected error occurred
  | 'allowed'                           // All validations passed

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

/**
 * Result from a single validator function
 */
export interface ValidatorResult<T = any> {
  passed: boolean                       // Did validation pass?
  state: ValidationState                // Current state
  data?: T                              // Data returned from validation (customer, location, etc.)
  error?: string                        // Error message if failed
}

/**
 * Customer data result
 */
export interface CustomerData {
  customer: Customer
}

/**
 * Restaurant status result
 */
export interface RestaurantStatusData {
  isOpen: boolean
  message: string
  nextOpening?: {
    day: string
    time: string
    hoursUntil: number
    minutesUntil: number
  } | null
  activeOrders?: Array<{
    id: string
    status: string
    createdAt: string
    orderNumber?: string
  }>
}

/**
 * GPS coordinates result
 */
export interface LocationCoordinates {
  latitude: number
  longitude: number
}

/**
 * Geofencing validation result
 */
export interface GeofencingData {
  city: {
    id: string
    name: string
  } | null
  zone: {
    id: string
    name: string
    description?: string
  } | null
  reason?: string
  message?: string
}

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

/**
 * Configuration object for useValidations hook
 * Enable only the validations you need
 */
export interface ValidationConfig {
  // Validation toggles
  customerExists?: boolean              // Validate customer exists in database
  customerStatus?: boolean              // Validate customer is not disabled
  restaurantStatus?: boolean            // Validate restaurant is open
  geoLocationSupport?: boolean          // Validate browser supports geolocation
  geoLocationGather?: boolean           // Gather GPS coordinates from browser
  geofencingValidate?: boolean          // Validate customer is within delivery zone
  
  // Global options
  skipCache?: boolean                   // Skip cache and force fresh validation
  forceRefresh?: boolean                // Clear cache before validating
  autoRetry?: boolean                   // Auto-retry on transient errors
  
  // Timeouts (milliseconds)
  geoLocationTimeout?: number           // Timeout for GPS gathering (default: 10000ms)
  apiTimeout?: number                   // Timeout for API calls (default: 5000ms)
}

/**
 * Options for individual validators (passed to validator functions)
 */
export interface ValidatorOptions {
  skipCache?: boolean
  timeout?: number
  highAccuracy?: boolean
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useValidations hook
 */
export interface UseValidationsReturn {
  // Current state
  state: ValidationState                // Current validation state
  isValidating: boolean                 // Is validation currently running?
  
  // Validation results
  passed: string[]                      // List of validations that passed (e.g., ['customerExists', 'customerStatus'])
  failed?: string                       // Name of validation that failed (if any)
  
  // Collected data from validations
  data: {
    customer?: Customer                 // Customer data (from customerExists)
    restaurantStatus?: RestaurantStatusData  // Restaurant status info
    location?: LocationCoordinates      // GPS coordinates
    geofencing?: GeofencingData         // City/zone info
  }
  
  // Error handling
  error?: string                        // Error message (user-friendly)
  
  // Actions
  retry: () => Promise<void>            // Retry validation from failure point
  reset: () => void                     // Reset to initial state
}

// ============================================================================
// VALIDATOR FUNCTION TYPE
// ============================================================================

/**
 * Type for validator functions
 * Each validator follows this signature
 */
export type ValidatorFunction<TData = any> = (
  params: any,
  options?: ValidatorOptions
) => Promise<ValidatorResult<TData>>

/**
 * Registry of all validators
 * Maps validator name to its function
 */
export interface ValidatorRegistry {
  customerExists: ValidatorFunction<CustomerData>
  customerStatus: ValidatorFunction<void>
  restaurantStatus: ValidatorFunction<RestaurantStatusData>
  geoLocationSupport: ValidatorFunction<void>
  geoLocationGather: ValidatorFunction<LocationCoordinates>
  geofencingValidate: ValidatorFunction<GeofencingData>
}

// ============================================================================
// CACHE TYPES
// ============================================================================

/**
 * Cache entry structure
 */
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Cache store interface
 */
export interface CacheStore {
  [key: string]: CacheEntry
}

// ============================================================================
// NEW REFACTORED HOOK TYPES (v2)
// ============================================================================

/**
 * Validation type names
 */
export type ValidationType =
  | 'customerExists'
  | 'customerStatus'
  | 'restaurantStatus'
  | 'geoLocationSupport'
  | 'geoLocationGather'
  | 'geofencingValidate'

/**
 * Validation phase (lifecycle state)
 */
export type ValidationPhase = 'idle' | 'validating' | 'success' | 'failed'

/**
 * Single validation configuration item
 */
export interface ValidationItem {
  name: ValidationType
  enabled?: boolean  // Default: true
}

/**
 * Hook configuration (v2)
 */
export interface UseValidationsConfig {
  /** Array of validations to run (order = execution order) */
  validations: ValidationItem[]
  
  /** Auto-run validation on mount (default: false) */
  autoRun?: boolean
  
  /** Skip cache for all validators (default: false) */
  skipCache?: boolean
  
  /** API timeout in milliseconds (default: 5000) */
  apiTimeout?: number
}

/**
 * Validation context passed to validators
 */
export interface ValidatorContext {
  /** Customer ID from URL params */
  customerId: string
  
  /** Accumulated data from previous validators */
  data: Record<string, any>
}

/**
 * Hook state (v2)
 */
export interface ValidationHookState {
  /** Current phase of validation lifecycle */
  phase: ValidationPhase
  
  /** Currently running validation step */
  currentStep?: string
  
  /** Validation that failed (if any) */
  failedStep?: string
  
  /** Successfully completed validations */
  completedSteps: string[]
  
  /** The actual validation state (for routing) */
  validationState?: ValidationState
  
  /** Error message if failed */
  error?: string
  
  /** Accumulated data from all validators */
  data: Record<string, any>
}

/**
 * Hook return type (v2)
 */
export interface UseValidationsReturnV2 {
  /** Current state */
  state: ValidationHookState
  
  /** Accumulated data (alias for state.data) */
  data: Record<string, any>
  
  /** Trigger validation manually */
  validate: () => Promise<void>
  
  /** Reset to initial state */
  reset: () => void
  
  /** Convenience: Is currently validating? */
  isValidating: boolean
  
  /** Convenience: Did all validations pass? */
  isSuccess: boolean
  
  /** Convenience: Did validation fail? */
  isFailed: boolean
}

/**
 * Validator function type (v2)
 * Accepts context instead of direct params
 */
export type ValidatorFunctionV2<TData = any> = (
  context: ValidatorContext,
  options?: ValidatorOptions
) => Promise<ValidatorResult<TData>>
