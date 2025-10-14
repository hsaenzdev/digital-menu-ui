import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Customer, LocationData } from '../types'

interface CustomerContextType {
  customer: Customer | null
  location: LocationData | null
  setCustomer: (customer: Customer) => void
  setLocation: (location: LocationData) => void
  clearCustomer: () => void
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

interface CustomerProviderProps {
  children: ReactNode
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  // In-memory only state - no localStorage persistence
  // URL params (/:customerId) are now the source of truth
  const [customer, setCustomerState] = useState<Customer | null>(null)
  const [location, setLocationState] = useState<LocationData | null>(null)

  const setCustomer = useCallback((customer: Customer) => {
    setCustomerState(customer)
  }, [])

  const setLocation = useCallback((location: LocationData) => {
    setLocationState(location)
  }, [])

  const clearCustomer = useCallback(() => {
    setCustomerState(null)
    setLocationState(null)
    // No localStorage cleanup needed - state is in-memory only
  }, [])

  return (
    <CustomerContext.Provider
      value={{
        customer,
        location,
        setCustomer,
        setLocation,
        clearCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => {
  const context = useContext(CustomerContext)
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider')
  }
  return context
}