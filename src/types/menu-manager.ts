/**
 * Types for Menu Manager
 * These match the backend API structure
 */

export interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ModifierGroup {
  id: string
  name: string
  description?: string
  isRequired: boolean
  minSelection: number
  maxSelection?: number
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  modifiers?: Modifier[]
}

export interface Modifier {
  id: string
  modifierGroupId: string
  name: string
  priceAdjustment: number
  displayOrder: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  displayOrder: number
  isAvailable: boolean
  isActive: boolean
  isSpecial: boolean
  calories?: number
  preparationTime?: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isSpicy: boolean
  allergens?: string
  stockCount?: number
  lowStockAlert?: number
  createdAt: string
  updatedAt: string
  category?: Category
  modifierGroups?: Array<{
    id: string
    itemId: string
    modifierGroupId: string
    modifierGroup: ModifierGroup
  }>
}

export interface CategoryFormData {
  name: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}

export interface ModifierGroupFormData {
  name: string
  description?: string
  isRequired?: boolean
  minSelection?: number
  maxSelection?: number
  displayOrder?: number
  isActive?: boolean
}

export interface ModifierFormData {
  modifierGroupId: string
  name: string
  priceAdjustment?: number
  displayOrder?: number
  isAvailable?: boolean
}

export interface MenuItemFormData {
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  displayOrder?: number
  isAvailable?: boolean
  isActive?: boolean
  isSpecial?: boolean
  calories?: number
  preparationTime?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  allergens?: string
  stockCount?: number
  lowStockAlert?: number
}
