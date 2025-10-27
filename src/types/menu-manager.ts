/**
 * Menu Manager Types
 * Types used by the menu management interface (staff only)
 */

import type { MenuCategory, MenuItem, ModifierGroup, Modifier } from './index'

// Re-export with manager-friendly names
export type Category = MenuCategory

// Extended MenuItem form data with dietary & preparation info
export interface MenuItemFormData extends Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> {
  isSpecial?: boolean // UI-only field
  preparationTime?: number // Alias for prepTime (in minutes)
  isSpicy?: boolean // UI representation of spicyLevel
}

export type CategoryFormData = Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>
export type ModifierGroupFormData = Omit<ModifierGroup, 'id'>
export type ModifierFormData = Omit<Modifier, 'id'>

// Re-export full types
export type { MenuItem, ModifierGroup, Modifier }

