/**
 * Shared types for order management
 */

import type { SelectedModifier } from './index'

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
  platform: string
  customerName?: string
  customerPhone?: string
  messengerPsid?: string
  address?: string
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
