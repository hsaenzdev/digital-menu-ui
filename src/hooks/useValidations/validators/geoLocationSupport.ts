/**
 * Geolocation Support Validator
 * 
 * Validates that the browser supports geolocation API
 * This is a browser check, no API call needed
 */

import type { ValidatorResult, ValidatorOptions } from '../types'

/**
 * Validate browser supports geolocation
 * 
 * @param _params - Not used
 * @param _options - Not used (no caching for browser checks)
 * @returns Validation result
 */
export async function validateGeoLocationSupport(
  _params: any,
  _options?: ValidatorOptions
): Promise<ValidatorResult<void>> {
  // Check if navigator.geolocation exists
  if (!navigator.geolocation) {
    return {
      passed: false,
      state: 'no_geolocation_support',
      error: 'Browser does not support geolocation',
    }
  }

  return {
    passed: true,
    state: 'allowed',
  }
}
