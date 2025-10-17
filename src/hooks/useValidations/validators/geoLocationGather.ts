/**
 * Geolocation Gather Validator
 * 
 * Gathers GPS coordinates from the browser
 * Uses navigator.geolocation.getCurrentPosition()
 */

import type { ValidatorResult, LocationCoordinates, ValidatorOptions } from '../types'
import { GEOLOCATION_OPTIONS } from '../constants'

/**
 * Gather GPS coordinates from browser
 * 
 * @param _params - Not used
 * @param options - Validator options (timeout, highAccuracy)
 * @returns Validation result with coordinates
 */
export async function validateGeoLocationGather(
  _params: any,
  options?: ValidatorOptions
): Promise<ValidatorResult<LocationCoordinates>> {
  return new Promise((resolve) => {
    const timeout = options?.timeout ?? GEOLOCATION_OPTIONS.timeout
    const enableHighAccuracy = options?.highAccuracy ?? GEOLOCATION_OPTIONS.enableHighAccuracy

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords
        
        resolve({
          passed: true,
          state: 'allowed',
          data: {
            latitude,
            longitude,
          },
        })
      },
      // Error callback
      (error) => {
        let errorMessage = 'Failed to get location'

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable'
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out'
        }

        resolve({
          passed: false,
          state: 'no_location_permission',
          error: errorMessage,
        })
      },
      // Options
      {
        enableHighAccuracy,
        timeout,
        maximumAge: GEOLOCATION_OPTIONS.maximumAge,
      }
    )
  })
}
