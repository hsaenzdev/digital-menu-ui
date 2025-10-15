import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { Customer, ApiResponse, LocationData, Order } from '../types'

type GeofenceStatus = 'checking' | 'allowed' | 'outside_zone' | 'no_location' | 'error'

interface DeliveryZoneValidation {
  success: boolean
  isValid: boolean
  withinDeliveryZone: boolean
  data: {
    reason: string
    message: string
    city: { id: string; name: string } | null
    zone: { id: string; name: string; description?: string } | null
  }
}

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { customer, setCustomer, setLocation, setCustomerLocationId } = useCustomer()
  
  // Page state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus>('checking')
  const [zoneInfo, setZoneInfo] = useState<DeliveryZoneValidation['data'] | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [resolvedLocationId, setResolvedLocationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  
  // Active order state
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  
  const hasCalledGeolocation = useRef(false)

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        setError('No customer ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/customers/${customerId}`)
        const data: ApiResponse<Customer> = await response.json()

        if (data.success && data.data) {
          setCustomer(data.data)
          // Pre-fill name if customer already has one
          if (data.data.name) {
            setName(data.data.name)
          }
        }
      } catch {
        setError('Failed to load customer information')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId, setCustomer])

  // Check for active orders
  useEffect(() => {
    const checkActiveOrders = async () => {
      if (!customer?.id) return
      
      try {
        const response = await fetch(`/api/customers/${customer.id}/orders`)
        const data: ApiResponse<Order[]> = await response.json()

        if (data.success && data.data) {
          // Find first active order (pending, confirmed, preparing, ready)
          const active = data.data.find(order => 
            ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
          )
          setActiveOrder(active || null)
        }
      } catch (err) {
        console.error('Failed to check active orders:', err)
      }
    }

    checkActiveOrders()
  }, [customer?.id])

  // Geofencing check
  useEffect(() => {
    const checkGeofencing = async () => {
      if (!navigator.geolocation) {
        setGeofenceStatus('no_location')
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            const response = await fetch('/api/geofencing/validate-delivery-zone', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude, longitude })
            })

            const validation: DeliveryZoneValidation = await response.json()

            if (validation.success && validation.withinDeliveryZone) {
              setGeofenceStatus('allowed')
              setZoneInfo(validation.data)
              
              // Store initial GPS coordinates
              setLocation({
                latitude,
                longitude,
                address: ''
              })

              // Auto-resolve location for the form
              if (!hasCalledGeolocation.current) {
                hasCalledGeolocation.current = true
                resolveCustomerLocation(latitude, longitude)
              }
            } else {
              setGeofenceStatus('outside_zone')
              setZoneInfo(validation.data)
            }
          } catch {
            setGeofenceStatus('error')
          }
        },
        () => {
          setGeofenceStatus('no_location')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }

    if (!loading && !error) {
      checkGeofencing()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error])

  // Resolve customer location (save/update in database)
  const resolveCustomerLocation = async (latitude: number, longitude: number) => {
    if (!customerId) return
    
    setLocationLoading(true)
    setLocationError('')

    try {
      const response = await fetch(
        `/api/customers/${customerId}/locations/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude })
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.location) {
          setAddress(data.location.address || '')
          setLocationData({
            latitude,
            longitude,
            address: data.location.address || ''
          })
          setResolvedLocationId(data.location.id)
          
          if (data.location.isExisting && data.location.address) {
            setLocationError('')
          } else if (!data.location.address) {
            setLocationError('GPS saved! Please enter your delivery address.')
          }
        }
      }
    } catch (err) {
      console.error('Location resolve error:', err)
      setLocationError('Please enter your address manually.')
    } finally {
      setLocationLoading(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    
    if (locationData) {
      setLocationData({
        ...locationData,
        address: newAddress
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setFormError('Please enter your name')
      return
    }

    if (!address.trim()) {
      setFormError('Please provide your delivery address')
      return
    }

    if (!customer?.id) {
      setFormError('No customer ID available. Please start from the link provided.')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const finalLocation: LocationData = locationData && locationData.latitude !== 0 
        ? { ...locationData, address: address.trim() }
        : {
            latitude: 0,
            longitude: 0,
            address: address.trim()
          }

      // Update customer name
      const nameResponse = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      if (!nameResponse.ok) {
        throw new Error('Failed to update customer')
      }

      // Update customer_location address if we have a resolved location
      if (resolvedLocationId && address.trim()) {
        const locationUpdateResponse = await fetch(
          `/api/customers/${customer.id}/locations/${resolvedLocationId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: address.trim() })
          }
        )

        if (!locationUpdateResponse.ok) {
          console.error('Failed to update location address')
        }
      }

      // Save to context
      setCustomer({ ...customer, name: name.trim() })
      setLocation(finalLocation)
      
      if (resolvedLocationId) {
        setCustomerLocationId(resolvedLocationId)
      }

      navigate(`/${customerId}/menu`)
    } catch {
      setFormError('Failed to save information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRetryLocation = () => {
    setGeofenceStatus('checking')
    window.location.reload()
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🔥</div>
            <p className="text-white text-2xl font-bold">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-8xl mb-4">🔥</div>
            <h3 className="text-3xl font-bold text-white drop-shadow-lg mb-3">Error</h3>
            <p className="text-white/90 text-lg drop-shadow font-medium">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Geofencing check in progress
  if (geofenceStatus === 'checking') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="relative">
              <div className="text-8xl mb-6">📍</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-white text-2xl font-bold mt-12">Checking your location...</p>
            <p className="text-white/80 text-sm mt-2">Making sure we can deliver to you</p>
          </div>
        </div>
      </div>
    )
  }

  // Outside delivery zone
  if (geofenceStatus === 'outside_zone') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6">😔</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
              We Can't Deliver to Your Area Yet
            </h2>
            <p className="text-white/90 text-lg mb-6 drop-shadow">
              {zoneInfo?.message || "Unfortunately, your location is outside our current delivery zones."}
            </p>
            
            {zoneInfo?.city && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
                <p className="text-white/80 text-sm">
                  <span className="font-semibold">Detected City:</span> {zoneInfo.city.name}
                </p>
                <p className="text-white/70 text-xs mt-1">
                  We're working on expanding our delivery areas!
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
                onClick={handleRetryLocation}
              >
                🔄 Try Again
              </button>
              
              <div className="text-white/80 text-sm">
                <p className="mb-2">📞 Want to know when we're in your area?</p>
                <p className="text-white/60 text-xs">Contact us: (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No location permission
  if (geofenceStatus === 'no_location') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6">📍</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
              Location Access Needed
            </h2>
            <p className="text-white/90 text-lg mb-6 drop-shadow">
              We need your location to check if we can deliver to your area.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-white/80 text-sm mb-2">
                <span className="font-semibold">How to enable location:</span>
              </p>
              <ol className="text-white/70 text-xs text-left space-y-1">
                <li>1. Click the 🔒 icon in your browser's address bar</li>
                <li>2. Allow location access for this site</li>
                <li>3. Refresh the page</li>
              </ol>
            </div>

            <button 
              className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
              onClick={handleRetryLocation}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Geofencing error
  if (geofenceStatus === 'error') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
              Something Went Wrong
            </h2>
            <p className="text-white/90 text-lg mb-6 drop-shadow">
              We couldn't verify your delivery zone. Please try again.
            </p>

            <button 
              className="w-full bg-white text-fire-600 font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:bg-fire-50 transform active:scale-95 transition-all"
              onClick={handleRetryLocation}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main form (geofencing passed)
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header - Consistent */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold text-center drop-shadow-md">🏠 Welcome</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-orange-50 to-white p-3 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-2.5">
          {/* Name Input - Compact */}
          <div className="bg-white rounded-lg shadow-sm p-2.5 border border-fire-200">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">👤</span>
              <label htmlFor="name" className="font-semibold text-gray-800 text-xs">
                Your Name
              </label>
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full px-2.5 py-1.5 border border-fire-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium text-sm"
            />
          </div>

          {/* Address Input - Compact */}
          <div className="bg-white rounded-lg shadow-sm p-2.5 border border-fire-200 flex-1 flex flex-col min-h-[100px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">📍</span>
                <label className="font-semibold text-gray-800 text-xs">
                  Delivery Address
                </label>
              </div>
              {locationData && locationData.latitude !== 0 && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">GPS ✓</span>
              )}
            </div>

            {locationLoading && (
              <div className="flex items-center justify-center gap-2 mb-1.5 py-1">
                <div className="w-3 h-3 border-2 border-fire-200 border-t-fire-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-xs font-medium">Getting location...</p>
              </div>
            )}

            <textarea
              className="w-full px-2.5 py-1.5 border border-fire-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium resize-none text-sm flex-1"
              placeholder="123 Main St, Apt 4B"
              value={address}
              onChange={handleAddressChange}
              disabled={locationLoading}
              required
            />

            {locationError && (
              <div className="mt-1 bg-amber-50 border border-amber-300 rounded p-1">
                <p className="text-amber-700 font-medium text-xs">💡 {locationError}</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {formError && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-2 flex items-center gap-2">
              <span className="text-sm">❌</span>
              <span className="text-red-700 font-semibold text-xs">{formError}</span>
            </div>
          )}

          {/* View Order History Button */}
          {customer?.id && (
            <button
              type="button"
              onClick={() => navigate(`/${customerId}/orders`)}
              className="w-full bg-white/80 backdrop-blur text-fire-600 border border-fire-300 font-semibold py-2 px-3 rounded-lg hover:bg-white hover:border-fire-400 transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <span className="text-sm">📋</span>
              <span>View Order History</span>
            </button>
          )}

          {/* Active Order Alert */}
          {activeOrder && (
            <div className="bg-gradient-to-r from-fire-50 to-amber-50 border-2 border-fire-400 rounded-lg p-2.5 shadow-md">
              <div className="flex items-start gap-2">
                <span className="text-xl">🔥</span>
                <div className="flex-1">
                  <h4 className="font-bold text-fire-800 text-xs mb-0.5">
                    Active Order in Progress
                  </h4>
                  <p className="text-fire-700 text-xs mb-1.5">
                    Order #{activeOrder.orderNumber} • {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/${customerId}/order-status/${activeOrder.id}`)}
                    className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-xs py-1.5 px-2.5 rounded-md hover:from-fire-600 hover:to-ember-600 transition-all shadow-md"
                  >
                    📋 View Order Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Button - Compact */}
      <div className="flex-shrink-0 bg-white border-t-2 border-fire-400 p-3 shadow-2xl">
        <button 
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-base py-3 px-4 rounded-lg shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={saving || !name.trim() || !address.trim() || locationLoading || !!activeOrder}
        >
          {saving ? '⏳ Saving...' : 
           activeOrder ? '🔒 Complete Active Order First' :
           !name.trim() ? '👆 Enter Your Name' :
           !address.trim() ? '👆 Enter Address' :
           '🔥 Continue to Menu'}
        </button>
        
        {activeOrder && (
          <p className="text-xs text-center text-amber-700 font-semibold mt-1.5">
            Complete or cancel your active order first
          </p>
        )}
        
        {(!name.trim() || !address.trim()) && !saving && !activeOrder && (
          <p className="text-xs text-center text-gray-500 mt-1.5">
            Complete all fields to continue
          </p>
        )}
      </div>
    </div>
  )
}
