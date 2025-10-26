/**
 * Validation Error Pages
 * 
 * Centralized export for all validation error page components.
 * These pages are shown when validations fail via useValidationRedirect hook.
 * 
 * Organized by concern:
 * - restaurant-closed: Restaurant status/hours errors
 * - customer-account: Customer account errors  
 * - geofencing: Delivery zone boundary errors
 * - geolocation: Browser geolocation errors
 * - generic: Fallback for unexpected errors
 */

// Restaurant Status Errors
export { RestaurantClosedPage } from './restaurant-closed'

// Customer Account Errors
export { CustomerNotFoundPage, CustomerDisabledPage } from './customer-account'

// Geofencing Errors
export { OutsideCityPage, OutsideZonePage } from './geofencing'

// Geolocation Errors
export { NoLocationPermissionPage, NoGeolocationSupportPage } from './geolocation'

// Generic Error
export { GenericErrorPage } from './generic'

