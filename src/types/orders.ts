/**
 * Orders Manager Types
 * Types used by the orders management interface (staff only)
 */

import type { Order as OrderType } from './index'

// Re-export with manager-friendly names
export type Order = OrderType
export type OrderStatus = OrderType['status']
