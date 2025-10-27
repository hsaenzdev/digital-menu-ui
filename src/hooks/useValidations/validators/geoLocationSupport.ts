/**
 * Geolocation Support Validator
 * 
 * Validates that the browser supports geolocation API
 * This is a browser check, no API call needed
 */

import type { ValidatorResult, ValidatorOptions, ValidatorContext } from '../types'

/**
 * Validate browser supports geolocation
 * 
 * @param _context - Not used
 * @param _options - Not used (no caching for browser checks)
 * @returns Validation result
 */
export async function validateGeoLocationSupport(
  _context: ValidatorContext,
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
