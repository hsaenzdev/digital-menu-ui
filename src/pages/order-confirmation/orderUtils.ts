/**
 * Calculate order total
 */
export function calculateTotal(subtotal: number, tax: number, tip: number): number {
  return subtotal + tax + tip
}
