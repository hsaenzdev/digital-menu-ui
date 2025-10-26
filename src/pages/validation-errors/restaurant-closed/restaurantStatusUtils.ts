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

  // Less than 1 minute (shouldn't happen, but handle it)
  if (hoursUntil === 0 && minutesUntil === 0) {
    return 'Opening very soon'
  }

  // Less than 1 hour - show minutes only
  if (hoursUntil === 0 && minutesUntil > 0) {
    return `In ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`
  }

  // Exactly on the hour
  if (hoursUntil > 0 && minutesUntil === 0) {
    return `In ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`
  }

  // Hours and minutes
  if (hoursUntil > 0 && minutesUntil > 0) {
    // For less than 24 hours, show detailed time
    if (hoursUntil < 24) {
      return `In ${hoursUntil}h ${minutesUntil}m`
    }
    // For 24+ hours, show hours only (simpler)
    return `In ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`
  }

  // Negative time (shouldn't happen, but handle gracefully)
  if (hoursUntil < 0 || minutesUntil < 0) {
    return null
  }

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
