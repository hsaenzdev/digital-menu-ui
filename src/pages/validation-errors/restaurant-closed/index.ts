/**
 * Restaurant Closed Error Pages
 * 
 * Error pages shown when restaurant is not accepting orders due to being closed.
 * Includes utilities for formatting restaurant status and displaying next opening times.
 */

export { RestaurantClosedPage } from './RestaurantClosedPage'
export { RestaurantClosedWithOrdersPage } from './RestaurantClosedWithOrdersPage'
export { useRestaurantStatus } from './useRestaurantStatus'
export type { RestaurantStatus } from './useRestaurantStatus'
export { getStatusEmoji, formatTimeUntilOpening, getStatusTitle } from './restaurantStatusUtils'
