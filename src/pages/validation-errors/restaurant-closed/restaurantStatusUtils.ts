import type { RestaurantStatus } from './useRestaurantStatus'

/**
 * Get appropriate emoji based on restaurant current status
 */
export function getStatusEmoji(status: RestaurantStatus['currentStatus']): string {
  switch (status) {
    case 'open':
      return '✅'
    case 'closed':
      return '🕐'
    case 'opening_soon':
      return '⏰'
    case 'closing_soon':
      return '⚠️'
    default:
      return '🕐'
  }
}

/**
 * Format time remaining until opening
 * Returns null if no next opening or if invalid data
 */
export function formatTimeUntilOpening(nextOpening: RestaurantStatus['nextOpening']): string | null {
  if (!nextOpening) return null

  const { hoursUntil, minutesUntil } = nextOpening

  // Handle same-day opening (less than 24 hours)
  if (hoursUntil === 0 && minutesUntil > 0) {
    return `In ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`
  }

  if (hoursUntil > 0 && minutesUntil > 0) {
    return `In ${hoursUntil}h ${minutesUntil}m`
  }

  if (hoursUntil > 0) {
    return `In ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`
  }

  // Opening very soon or next day
  return null
}

/**
 * Get restaurant status title for error pages
 */
export function getStatusTitle(status: RestaurantStatus['currentStatus']): string {
  switch (status) {
    case 'closed':
      return "We're Currently Closed"
    case 'opening_soon':
      return "Opening Soon"
    case 'closing_soon':
      return "Closing Soon"
    case 'open':
      return "We're Open"
    default:
      return "We're Currently Closed"
  }
}
