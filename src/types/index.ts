// Customer types
export interface Customer {
  id?: string
  platform?: string // 'whatsapp' | 'messenger'
  whatsappNumber?: string // For WhatsApp customers only
  messengerPsid?: string // For Messenger customers only
  name: string
  email?: string
  birthday?: Date
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Menu types
export interface MenuCategory {
  id: string
  name: string
  description: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ModifierGroup {
  id: string
  name: string
  description?: string
  isRequired: boolean
  minSelection: number
  maxSelection?: number
  displayOrder: number
  modifiers: Modifier[]
}

export interface Modifier {
  id: string
  modifierGroupId: string
  name: string
  priceAdjustment: number
  displayOrder: number
  isAvailable: boolean
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  imageUrl?: string
  allergens?: string | string[] // API returns string, we'll parse to array
  isAvailable: boolean
  displayOrder: number
  modifierGroups?: ModifierGroup[]
  createdAt: Date
  updatedAt: Date
}

// Cart types
export interface CartItem {
  id: string
  itemId: string
  itemName: string
  itemPrice: number
  quantity: number
  unitPrice: number
  totalPrice: number
  specialNotes?: string
  selectedModifiers: SelectedModifier[]
}

export interface SelectedModifier {
  modifierId: string
  modifierName: string
  selectedOptions: {
    optionId: string
    optionName: string
    price: number
  }[]
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
}

// Order types (customer-facing)
export interface Order {
  id: string
  orderNumber: number
  customerId: string
  customer?: Customer // Customer data (optional for backwards compatibility)
  address: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  subtotal: number
  tax: number
  tip: number
  total: number
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LocationData {
  latitude: number
  longitude: number
  address?: string
}