/**
 * Validators Index
 * 
 * Central export point for all validator functions
 * Makes it easy to add new validators - just add the import and export here
 */

export { validateCustomerExists } from './customerExists'
export { validateCustomerStatus } from './customerStatus'
export { validateRestaurantStatus } from './restaurantStatus'
export { validateGeoLocationSupport } from './geoLocationSupport'
export { validateGeoLocationGather } from './geoLocationGather'
export { validateGeofencingValidate } from './geofencingValidate'

/**
 * TO ADD A NEW VALIDATOR:
 * 
 * 1. Create a new file: validators/yourValidator.ts
 * 2. Implement the validator function following this pattern:
 *    - Accept params and options?: ValidatorOptions
 *    - Return Promise<ValidatorResult<YourDataType>>
 *    - Handle caching if applicable (use utils)
 *    - Return proper state (allowed, error, or custom state)
 * 
 * 3. Add export here: export { validateYourValidator } from './yourValidator'
 * 
 * 4. Update constants.ts:
 *    - Add to VALIDATION_ORDER (execution order)
 *    - Add to VALIDATION_DEPS if it depends on other validators
 *    - Add to CACHEABLE_VALIDATIONS if it can be cached
 * 
 * 5. Update types.ts:
 *    - Add custom state to ValidationState union (if needed)
 *    - Add data type interface (if returning data)
 *    - Add to ValidatorRegistry interface
 * 
 * 6. The hook will automatically pick it up!
 */
