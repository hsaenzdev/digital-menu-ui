import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { Customer, ApiResponse } from '../types'

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
  const { setCustomer, setLocation } = useCustomer()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus>('checking')
  const [zoneInfo, setZoneInfo] = useState<DeliveryZoneValidation['data'] | null>(null)

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
        }
      } catch {
        setError('Failed to load customer information')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId, setCustomer])

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
              
              setLocation({
                latitude,
                longitude,
                address: ''
              })
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
  }, [loading, error, setLocation])

  const handleStartOrder = () => {
    navigate(`/${customerId}/setup`)
  }

  const handleRetryLocation = () => {
    setGeofenceStatus('checking')
    window.location.reload()
  }

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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-32 space-y-4">
          
          {/* Welcome Message */}
          <div className="text-center space-y-2 px-4 pt-2">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              Welcome to our restaurant!
            </h2>
            <p className="text-white/95 text-base font-medium drop-shadow">
              Order your favorite meals with just a few taps
            </p>
          </div>

          {/* Delivery Zone Confirmation */}
          {zoneInfo?.zone && (
            <div className="mx-4 bg-green-500/20 backdrop-blur border-2 border-green-300 rounded-xl p-3">
              <div className="flex items-center gap-2 text-white mb-1">
                <span className="text-xl">✅</span>
                <span className="font-bold text-sm">Delivery Available</span>
              </div>
              <p className="text-white/90 text-xs">
                {zoneInfo.zone.name} • {zoneInfo.city?.name}
              </p>
            </div>
          )}
          
          {/* Features List */}
          <div className="grid gap-3 px-4 max-w-lg mx-auto">
            <div className="flex items-center gap-3 p-4 bg-white/95 backdrop-blur rounded-2xl border-2 border-fire-300 shadow-xl">
              <span className="text-3xl">📱</span>
              <div className="flex-1">
                <div className="text-gray-800 font-bold text-base">Easy mobile ordering</div>
                <div className="text-gray-600 text-xs">Browse and order in seconds</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/95 backdrop-blur rounded-2xl border-2 border-fire-300 shadow-xl">
              <span className="text-3xl">🚚</span>
              <div className="flex-1">
                <div className="text-gray-800 font-bold text-base">Fast delivery</div>
                <div className="text-gray-600 text-xs">Hot food at your door</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/95 backdrop-blur rounded-2xl border-2 border-fire-300 shadow-xl">
              <span className="text-3xl">💳</span>
              <div className="flex-1">
                <div className="text-gray-800 font-bold text-base">Secure payment</div>
                <div className="text-gray-600 text-xs">Safe and reliable checkout</div>
              </div>
            </div>
          </div>

          {/* Info Footer */}
          <div className="text-center space-y-1 px-4 pt-1">
            <div className="flex items-center justify-center gap-2 text-white/90 font-medium text-sm drop-shadow">
              <span>🕐</span>
              <span>Open daily: 10:00 AM - 10:00 PM</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/90 font-medium text-sm drop-shadow">
              <span>📞</span>
              <span>Questions? Call (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Start Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
        <button 
          className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-xl py-5 px-8 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
          onClick={handleStartOrder}
        >
          🔥 Start Your Order
        </button>
      </div>
    </div>
  )
}