import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { LocationData } from '../types'

export const LocationPage: React.FC = () => {
  const navigate = useNavigate()
  const { setLocation } = useCustomer()
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getCurrentLocation = async () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Call our backend geocoding endpoint
          const response = await fetch(
            `http://localhost:3000/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
          )
          
          if (response.ok) {
            const data = await response.json()
            const geocodedAddress = data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            
            // Set the address in the input field (user can edit)
            setAddress(geocodedAddress)
            
            // Store location data with coordinates
            const location: LocationData = {
              latitude,
              longitude,
              address: geocodedAddress
            }
            
            setLocationData(location)
          } else {
            // Fallback to coordinates if geocoding fails
            const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setAddress(fallbackAddress)
            
            setLocationData({
              latitude,
              longitude,
              address: fallbackAddress
            })
          }
          
          setLoading(false)
        } catch (err) {
          console.error('Geocoding error:', err)
          // Fallback to coordinates
          const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setAddress(fallbackAddress)
          
          setLocationData({
            latitude,
            longitude,
            address: fallbackAddress
          })
          
          setLoading(false)
        }
      },
      (error) => {
        setError(`Location error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    
    // Update location data with new address (keep coordinates)
    if (locationData) {
      setLocationData({
        ...locationData,
        address: newAddress
      })
    }
  }

  const handleContinue = () => {
    if (!address.trim()) {
      setError('Please provide your delivery address')
      return
    }

    // Ensure we have location data with the current address
    const finalLocation: LocationData = locationData || {
      latitude: 0,
      longitude: 0,
      address: address.trim()
    }

    // Update address to match input
    finalLocation.address = address.trim()

    setLocation(finalLocation)
    navigate('/customer-info')
  }

  useEffect(() => {
    // Auto-fetch location on mount
    getCurrentLocation()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
        <button 
          className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors mb-3"
          onClick={() => navigate(-1)}
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">📍 Your Location</h1>
        <p className="text-fire-100 text-sm mt-1">We need your location to calculate delivery time and fees</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-32">{/* Extra bottom padding for fixed button */}

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="text-7xl animate-pulse-slow">🎯</div>
            </div>
            
            {loading && (
              <div className="text-center space-y-3">
                <p className="text-gray-600 font-medium">Getting your location...</p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-fire-200 border-t-fire-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-md">
                <p className="text-red-600 font-bold">❌ {error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-lg">
                  📍 Delivery Address
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-fire-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium shadow-md resize-none"
                  placeholder="Enter your delivery address or use GPS..."
                  rows={4}
                  value={address}
                  onChange={handleAddressChange}
                  disabled={loading}
                />
                <p className="text-gray-500 text-sm mt-2">
                  {locationData && locationData.latitude !== 0 ? (
                    <span>📌 GPS: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}</span>
                  ) : (
                    <span>💡 Click "Use My Location" to auto-fill with GPS</span>
                  )}
                </p>
              </div>

              <button 
                className="w-full bg-white text-fire-600 border-2 border-fire-500 font-bold py-3 px-6 rounded-xl hover:bg-fire-50 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={getCurrentLocation}
                disabled={loading}
              >
                {loading ? '⏳ Getting Location...' : '📍 Use My Location'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
        <button 
          className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleContinue}
          disabled={!address.trim() || loading}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}