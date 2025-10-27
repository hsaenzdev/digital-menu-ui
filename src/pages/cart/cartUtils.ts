/**
 * Cart utility functions
 */

/**
 * Calculate tip amount based on percentage
 */
export function calculateTipByPercentage(subtotal: number, percentage: number): number {
  return (subtotal * percentage) / 100
}

/**
 * Parse custom tip value from string input
 */
export function parseCustomTip(value: string): number {
  return parseFloat(value) || 0
}

/**
 * Tip percentage options
 */
export const TIP_PERCENTAGES = [15, 18, 20, 25] as const

/**
 * Default tip percentage
 */
export const DEFAULT_TIP_PERCENTAGE = 15
