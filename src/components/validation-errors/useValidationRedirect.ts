import { useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useValidations } from '../../hooks/useValidations'
import type {
  ValidationState,
  ValidationConfig,
  UseValidationsReturn
} from '../../hooks/useValidations/types'

/**
 * Configuration for useValidationRedirect hook
 */
export interface ValidationRedirectConfig {
  /** Customer ID to validate */
  customerId: string
  
  /** Which validations to run for this view */
  requiredValidations: ValidationConfig
  
  /** Current path to return to on retry */
  currentPath: string
  
  /** Optional: Active order (for restaurant closed special case) */
  activeOrder?: {
    id: string
    status: string
  } | null
  
  /** Optional: Custom error handling (override default redirect) */
  onValidationError?: (state: ValidationState, data: any) => void
}

/**
 * Return type for useValidationRedirect hook
 */
export interface UseValidationRedirectReturn extends UseValidationsReturn {
  /** Whether validations are currently running */
  isValidating: boolean
  
  /** Current validation state */
  state: ValidationState
  
  /** Whether all validations passed */
  isAllowed: boolean
}

/**
 * Maps validation states to error route paths
 * 
 * @param state - Validation state from useValidations
 * @param customerId - Customer ID for building route path
 * @returns Error route path
 */
function mapStateToRoute(
  state: ValidationState,
  customerId: string
): string {
  switch (state) {
    case 'customer_not_found':
      // Customer doesn't exist - no customerId in route
      return '/error/customer-not-found'
    
    case 'customer_disabled':
      return `/${customerId}/error/customer-disabled`
    
    case 'restaurant_closed':
    case 'restaurant_closed_active_orders':
      // All restaurant closed cases go to same page
      // The page will check for activeOrder and show appropriate UI
      return `/${customerId}/error/restaurant-closed`
    
    case 'no_geolocation_support':
      return `/${customerId}/error/no-geolocation-support`
    
    case 'no_location_permission':
      return `/${customerId}/error/no-location-permission`
    
    case 'outside_city':
      return `/${customerId}/error/outside-city`
    
    case 'outside_zone':
      return `/${customerId}/error/outside-zone`
    
    case 'error':
    default:
      return `/${customerId}/error/generic`
  }
}

/**
 * Hook that performs validations and automatically redirects on failure.
 * 
 * This hook combines useValidations with automatic error handling via routing.
 * When a validation fails, it redirects to the appropriate error page.
 * 
 * Usage:
 * ```tsx
 * const { isValidating } = useValidationRedirect({
 *   customerId: customerId!,
 *   requiredValidations: {
 *     customerExists: true,
 *     customerStatus: true,
 *     restaurantStatus: true,
 *     geofencingValidate: true
 *   },
 *   currentPath: location.pathname
 * })
 * 
 * if (isValidating) {
 *   return <LoadingSpinner />
 * }
 * 
 * // If we reach here, validation passed!
 * return <PageContent />
 * ```
 * 
 * @param config - Validation configuration
 * @returns Validation state and helpers
 */
export function useValidationRedirect(
  config: ValidationRedirectConfig
): UseValidationRedirectReturn {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Run validations using our core validation hook
  const validationResult = useValidations(
    config.customerId,
    config.requiredValidations
  )
  
  // Watch for validation failures and auto-redirect
  useEffect(() => {
    // Don't redirect while validating
    if (validationResult.isValidating) {
      return
    }
    
    // Don't redirect if validation passed
    if (validationResult.state === 'allowed') {
      return
    }
    
    // Validation failed - handle redirect
    const currentState = validationResult.state
    const validationData = validationResult.data
    
    // Allow custom error handling (override default redirect)
    if (config.onValidationError) {
      config.onValidationError(currentState, validationData)
      return
    }
    
    // Determine error route
    const errorRoute = mapStateToRoute(currentState, config.customerId)
    
    // Prepare state to pass to error page
    const navigationState = {
      // Where to return to on "Try Again"
      returnTo: config.currentPath,
      
      // Current validation state
      validationState: currentState,
      
      // All validation data (customer, restaurant, geofencing, etc.)
      ...validationData,
      
      // Include active order if exists (for restaurant closed special case)
      activeOrder: config.activeOrder || undefined
    }
    
    // Navigate to error page with state
    // Note: Using replace prevents "back" button from returning to this failed state
    navigate(errorRoute, {
      state: navigationState,
      replace: false // Keep in history so user can use back button
    })
  }, [
    validationResult.state,
    validationResult.isValidating,
    validationResult.data,
    config.activeOrder,
    config.currentPath,
    config.onValidationError,
    navigate,
    location.pathname
  ])
  
  return {
    ...validationResult,
    isValidating: validationResult.isValidating,
    state: validationResult.state,
    isAllowed: validationResult.state === 'allowed'
  }
}

/**
 * Helper hook for error pages to handle "Try Again" functionality
 * 
 * Usage in error pages:
 * ```tsx
 * const { customerId, handleTryAgain } = useErrorPageHelpers()
 * 
 * return (
 *   <button onClick={handleTryAgain}>
 *     Try Again
 *   </button>
 * )
 * ```
 */
export function useErrorPageHelpers() {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams<{ customerId: string }>()
  
  // Get state passed from useValidationRedirect
  const state = location.state as any
  const validationState = state?.validationState
  const activeOrder = state?.activeOrder
  
  /**
   * Navigate back to customer home to retry validation
   */
  const handleTryAgain = () => {
    if (customerId) {
      navigate(`/${customerId}`)
    } else {
      // Fallback for customer-not-found page (no customerId in URL)
      navigate('/')
    }
  }
  
  /**
   * Navigate to order tracking page (for restaurant closed with active orders)
   */
  const handleTrackOrder = () => {
    if (customerId && activeOrder?.id) {
      navigate(`/${customerId}/order-status/${activeOrder.id}`)
    }
  }
  
  /**
   * Navigate to order history page
   */
  const handleViewHistory = () => {
    if (customerId) {
      navigate(`/${customerId}/orders`)
    }
  }
  
  return {
    customerId,
    validationState,
    activeOrder,
    restaurantStatus: state?.restaurantStatus,
    geofencingData: state?.geofencingData,
    customer: state?.customer,
    handleTryAgain,
    handleTrackOrder,
    handleViewHistory
  }
}
