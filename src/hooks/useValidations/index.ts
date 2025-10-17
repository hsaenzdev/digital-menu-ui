/**
 * useValidations Hook
 * 
 * Main validation hook for customer views
 * Orchestrates multiple validators based on configuration
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { 
  ValidationConfig, 
  ValidationState, 
  UseValidationsReturn,
  ValidatorResult 
} from './types'
import { VALIDATION_ORDER, VALIDATION_DEPS } from './constants'
import { 
  validationCache,
  mergeValidationData,
  getErrorMessage,
  buildRetryConfig 
} from './utils'
import {
  validateCustomerExists,
  validateCustomerStatus,
  validateRestaurantStatus,
  validateGeoLocationSupport,
  validateGeoLocationGather,
  validateGeofencingValidate,
} from './validators'

/**
 * Validation hook for customer views
 * 
 * @param customerId - Customer ID from URL params
 * @param config - Validation configuration (which validations to run)
 * @returns Validation state, data, and control functions
 * 
 * @example
 * // Welcome page - all validations
 * const { state, data, retry } = useValidations(customerId, {
 *   customerExists: true,
 *   customerStatus: true,
 *   restaurantStatus: true,
 *   geoLocationSupport: true,
 *   geoLocationGather: true,
 *   geofencingValidate: true
 * })
 * 
 * @example
 * // Menu page - only customer and restaurant
 * const { state } = useValidations(customerId, {
 *   customerExists: true,
 *   customerStatus: true,
 *   restaurantStatus: true
 * })
 */
export function useValidations(
  customerId: string,
  config: ValidationConfig = {}
): UseValidationsReturn {
  // State
  const [state, setState] = useState<ValidationState>('idle')
  const [isValidating, setIsValidating] = useState(false)
  const [passed, setPassed] = useState<string[]>([])
  const [failed, setFailed] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [data, setData] = useState<any>({})

  // Store results for data merging
  const resultsRef = useRef<Map<string, ValidatorResult>>(new Map())
  
  // Store config for retry
  const configRef = useRef<ValidationConfig>(config)
  
  // Update config ref when it changes
  useEffect(() => {
    configRef.current = config
  }, [config])

  /**
   * Get validator function by name
   */
  const getValidator = useCallback((name: string): any => {
    const validators: Record<string, any> = {
      customerExists: validateCustomerExists,
      customerStatus: validateCustomerStatus,
      restaurantStatus: validateRestaurantStatus,
      geoLocationSupport: validateGeoLocationSupport,
      geoLocationGather: validateGeoLocationGather,
      geofencingValidate: validateGeofencingValidate,
    }
    return validators[name]
  }, [])

  /**
   * Check if validation dependencies are met
   */
  const checkDependencies = useCallback((validationName: string): boolean => {
    const deps = VALIDATION_DEPS[validationName]
    if (!deps) return true

    // Check if all dependencies have passed
    return deps.every(dep => passed.includes(dep))
  }, [passed])

  /**
   * Run a single validator
   */
  const runValidator = useCallback(async (
    name: string,
    params: any,
    options?: any
  ): Promise<ValidatorResult> => {
    const validator = getValidator(name)
    if (!validator) {
      throw new Error(`Validator ${name} not found`)
    }

    const result = await validator(params, options)
    resultsRef.current.set(name, result)
    return result
  }, [getValidator])

  /**
   * Main validation orchestrator
   */
  const validate = useCallback(async () => {
    if (!customerId) {
      setState('error')
      setError('No customer ID provided')
      return
    }

    setIsValidating(true)
    setState('loading')
    setPassed([])
    setFailed(undefined)
    setError(undefined)

    // Clear cache if forceRefresh is true
    if (config.forceRefresh) {
      validationCache.clear()
    }

    const validationOptions = {
      skipCache: config.skipCache,
      timeout: config.apiTimeout,
      highAccuracy: true,
    }

    // Storage for passing data between validators
    let gpsCoordinates: { latitude: number; longitude: number } | null = null

    try {
      // Execute validations in order
      for (const validationName of VALIDATION_ORDER) {
        // Skip if not enabled in config
        const configKey = validationName as keyof ValidationConfig
        if (!config[configKey]) {
          continue
        }

        // Check dependencies
        if (!checkDependencies(validationName)) {
          continue
        }

        // Determine parameters for validator
        let params: any = customerId

        // Special handling for validators that need specific params
        if (validationName === 'restaurantStatus') {
          params = null // Restaurant status doesn't need customer ID
        } else if (validationName === 'geoLocationSupport' || validationName === 'geoLocationGather') {
          params = null // Browser checks don't need params
        } else if (validationName === 'geofencingValidate') {
          if (!gpsCoordinates) {
            // Skip if we don't have coordinates yet
            continue
          }
          params = gpsCoordinates
        }

        // Run the validator
        const result = await runValidator(validationName, params, validationOptions)

        // Store GPS coordinates if this was geoLocationGather
        if (validationName === 'geoLocationGather' && result.data) {
          gpsCoordinates = result.data
        }

        // Check if validation passed
        if (!result.passed) {
          // Validation failed - stop here
          setState(result.state)
          setFailed(validationName)
          setError(result.error || getErrorMessage(result.state))
          setIsValidating(false)
          
          // Merge data collected so far
          const mergedData = mergeValidationData(resultsRef.current)
          setData(mergedData)
          
          return
        }

        // Validation passed - add to passed list
        setPassed(prev => [...prev, validationName])
      }

      // All validations passed!
      setState('allowed')
      setIsValidating(false)

      // Merge all collected data
      const mergedData = mergeValidationData(resultsRef.current)
      setData(mergedData)

    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Unexpected error')
      setIsValidating(false)
    }
  }, [customerId, config, checkDependencies, runValidator])

  /**
   * Retry validation (clears cache and re-runs)
   */
  const retry = useCallback(async () => {
    const retryConfig = buildRetryConfig(failed || '', configRef.current)
    configRef.current = retryConfig
    await validate()
  }, [failed, validate])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState('idle')
    setIsValidating(false)
    setPassed([])
    setFailed(undefined)
    setError(undefined)
    setData({})
    resultsRef.current.clear()
  }, [])

  return {
    state,
    isValidating,
    passed,
    failed,
    data,
    error,
    retry,
    reset,
  }
}

// Re-export types for convenience
export type { ValidationConfig, ValidationState, UseValidationsReturn } from './types'
