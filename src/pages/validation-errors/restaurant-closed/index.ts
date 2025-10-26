/**
 * Restaurant Closed Error Pages
 * 
 * Error page shown when restaurant is not accepting orders due to being closed.
 * Includes utilities for formatting restaurant status and displaying next opening times.
 * 
 * The RestaurantClosedPage handles both cases:
 * - Customers without active orders
 * - Customers with active orders (shows tracking option)
 */

export { RestaurantClosedPage } from './RestaurantClosedPage'
export { useRestaurantStatus } from './useRestaurantStatus'
export type { RestaurantStatus } from './useRestaurantStatus'
export { getStatusEmoji, formatTimeUntilOpening, getStatusTitle } from './restaurantStatusUtils'
