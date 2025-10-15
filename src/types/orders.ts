/**
 * Shared types for order management
 */

import type { SelectedModifier, Customer, CustomerLocation } from './index'

export interface OrderItem {
  id: string
  itemName: string
  itemPrice: number
  quantity: number
  totalPrice: number
  specialNotes?: string
  selectedModifiers?: SelectedModifier[]
}

export interface Order {
  id: string
  orderNumber: number
  customerId: string
  customer: Customer // Customer data via relationship
  customerLocationId: string
  customerLocation?: CustomerLocation
  total: number
  subtotal: number
  tax: number
  tip: number
  status: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
