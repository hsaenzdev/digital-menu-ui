/**
 * useValidations Hook (v2 - Refactored)
 * 
 * Clean validation orchestrator for customer views
 * - Sequential execution in configured order
 * - Early exit on first failure
 * - Data accumulation between validators
 * - Manual or auto-trigger
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  UseValidationsConfig,
  UseValidationsReturnV2,
  ValidationHookState,
  ValidatorContext,
  ValidatorResult,
  ValidationType,
} from './types'
import { TIMEOUTS } from './constants'
import {
  validateCustomerExists,
  validateCustomerStatus,
  validateRestaurantStatus,
  validateGeoLocationSupport,
  validateGeoLocationGather,
  validateGeofencingValidate,
} from './validators'

// ============================================================================
// VALIDATOR REGISTRY
// ============================================================================

/**
 * Maps validator names to their functions
 * Single source of truth for available validators
 */
const VALIDATOR_REGISTRY = {
  customerExists: validateCustomerExists,
  customerStatus: validateCustomerStatus,
  restaurantStatus: validateRestaurantStatus,
  geoLocationSupport: validateGeoLocationSupport,
  geoLocationGather: validateGeoLocationGather,
  geofencingValidate: validateGeofencingValidate,
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get initial state
 */
function getInitialState(): ValidationHookState {
  return {
    phase: 'idle',
    completedSteps: [],
    data: {},
  }
}

/**
 * Build validator context from current state
 */
function buildContext(
  customerId: string,
  accumulatedData: Record<string, any>
): ValidatorContext {
  return {
    customerId,
    data: accumulatedData,
  }
}

/**
 * Get validator function by name
 */
function getValidator(name: ValidationType) {
  const validator = VALIDATOR_REGISTRY[name]
  if (!validator) {
    throw new Error(`Validator '${name}' not found in registry`)
  }
  return validator
}

/**
 * Build validator options from config
 */
function buildValidatorOptions(config: UseValidationsConfig) {
  return {
    skipCache: config.skipCache ?? false,
    timeout: config.apiTimeout ?? TIMEOUTS.API_CALL,
    highAccuracy: true,
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * useValidations Hook
 * 
 * @param customerId - Customer ID from URL params
 * @param config - Validation configuration
 * @returns Validation state and control functions
 * 
 * @example
 * // Welcome page - all validations, manual trigger
 * const { state, data, validate } = useValidations(customerId, {
 *   validations: [
 *     { name: 'customerExists' },
 *     { name: 'customerStatus' },
 *     { name: 'restaurantStatus' },
 *     { name: 'geoLocationSupport' },
 *     { name: 'geoLocationGather' },
 *     { name: 'geofencingValidate' }
 *   ]
 * })
 * 
 * useEffect(() => {
 *   if (customerId) validate()
 * }, [customerId])
 * 
 * @example
 * // Menu page - subset, auto-run
 * const { state, isValidating } = useValidations(customerId, {
 *   validations: [
 *     { name: 'customerExists' },
 *     { name: 'customerStatus' },
 *     { name: 'restaurantStatus' }
 *   ],
 *   autoRun: true
 * })
 */
export function useValidations(
  customerId: string,
  config: UseValidationsConfig
): UseValidationsReturnV2 {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, setState] = useState<ValidationHookState>(getInitialState())
  
  // Store config in ref to avoid re-creating validate function on every render
  const configRef = useRef(config)
  
  // Update config ref when it changes
  useEffect(() => {
    configRef.current = config
  }, [config])

  // ============================================================================
  // CORE VALIDATION LOGIC
  // ============================================================================

  /**
   * Main validation orchestrator
   * Runs validations sequentially in configured order
   */
  const validate = useCallback(async () => {
    const currentConfig = configRef.current
    
    // Guard: Must have customer ID
    if (!customerId) {
      setState({
        phase: 'failed',
        failedStep: 'init',
        validationState: 'error',
        error: 'No customer ID provided',
        completedSteps: [],
        data: {},
      })
      return
    }

    // Guard: Must have validations configured
    if (!currentConfig.validations || currentConfig.validations.length === 0) {
      setState({
        phase: 'failed',
        failedStep: 'config',
        validationState: 'error',
        error: 'No validations configured',
        completedSteps: [],
        data: {},
      })
      return
    }

    // Start validation
    setState({
      phase: 'validating',
      completedSteps: [],
      data: {},
    })

    const accumulatedData: Record<string, any> = {}
    const completedSteps: string[] = []
    const validatorOptions = buildValidatorOptions(currentConfig)

    try {
      // Execute validations sequentially in order
      for (const validation of currentConfig.validations) {
        const { name, enabled = true } = validation

        // Skip if disabled
        if (!enabled) {
          continue
        }

        // Update current step
        setState((prev) => ({
          ...prev,
          currentStep: name,
        }))

        // Build context with accumulated data
        const context = buildContext(customerId, accumulatedData)

        // Get and run validator
        const validator = getValidator(name)
        const result: ValidatorResult = await validator(context, validatorOptions)

        // Check if validation failed
        if (!result.passed) {
          // Stop here - validation failed
          setState({
            phase: 'failed',
            currentStep: undefined,
            failedStep: name,
            completedSteps: completedSteps,
            validationState: result.state,
            error: result.error || `Validation failed: ${name}`,
            data: accumulatedData,
          })
          return
        }

        // Validation passed - accumulate data
        if (result.data) {
          accumulatedData[name] = result.data
        }
        completedSteps.push(name)
      }

      // All validations passed!
      setState({
        phase: 'success',
        currentStep: undefined,
        completedSteps: completedSteps,
        validationState: 'allowed',
        data: accumulatedData,
      })
    } catch (err) {
      // Unexpected error
      setState({
        phase: 'failed',
        currentStep: undefined,
        failedStep: state.currentStep,
        completedSteps: completedSteps,
        validationState: 'error',
        error: err instanceof Error ? err.message : 'Unexpected validation error',
        data: accumulatedData,
      })
    }
  }, [customerId])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState(getInitialState())
  }, [])

  // ============================================================================
  // AUTO-RUN EFFECT
  // ============================================================================

  /**
   * Auto-run validation on mount if configured
   */
  useEffect(() => {
    if (configRef.current.autoRun && customerId) {
      validate()
    }
    // Only run on mount or when customerId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    state,
    data: state.data,
    validate,
    reset,
    isValidating: state.phase === 'validating',
    isSuccess: state.phase === 'success',
    isFailed: state.phase === 'failed',
  }
}

// Re-export types for convenience
export type {
  UseValidationsConfig,
  UseValidationsReturnV2,
  ValidationHookState,
  ValidationType,
} from './types'
