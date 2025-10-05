import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { LocationData } from '../types'

export const LocationPage: React.FC = () => {
  const navigate = useNavigate()
  const { setLocation } = useCustomer()
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [manualAddress, setManualAddress] = useState('')
  const [useManualAddress, setUseManualAddress] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getCurrentLocation = () => {
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
          // In a real app, you would use a geocoding service to get the address
          // For now, we'll use a mock address
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          
          const location: LocationData = {
            latitude,
            longitude,
            address: `Near ${address}` // Mock address
          }
          
          setLocationData(location)
          setLoading(false)
        } catch {
          setError('Failed to get address for your location')
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

  const handleManualAddressSubmit = () => {
    if (!manualAddress.trim()) {
      setError('Please enter your address')
      return
    }

    // Mock coordinates for manual address
    const location: LocationData = {
      latitude: 40.7128, // Mock NYC coordinates
      longitude: -74.0060,
      address: manualAddress.trim()
    }
    
    setLocationData(location)
  }

  const handleContinue = () => {
    if (!locationData) {
      setError('Please provide your location')
      return
    }

    setLocation(locationData)
    navigate('/customer-info')
  }

  useEffect(() => {
    // Auto-try to get location on load
    if (!useManualAddress) {
      getCurrentLocation()
    }
  }, [useManualAddress])

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

          {/* Location Content */}
          <div className="space-y-6">
            {!useManualAddress ? (
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

                {locationData && !loading && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 space-y-2 shadow-lg">
                    <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                      <span>✅</span> Location Found
                    </h3>
                    <p className="text-gray-800 font-medium text-lg break-words">
                      {locationData.address}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-md">
                    <p className="text-red-600 font-bold">❌ {error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={getCurrentLocation}
                    disabled={loading}
                  >
                    {loading ? '⏳ Getting Location...' : '📍 Use My Location'}
                  </button>
                  
                  <button 
                    className="w-full bg-white text-fire-600 border-2 border-fire-500 font-bold py-3 px-6 rounded-xl hover:bg-fire-50 transition-all shadow-md"
                    onClick={() => setUseManualAddress(true)}
                  >
                    📝 Enter Address Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-gray-800">📝 Enter Your Address</h3>
                  <button 
                    className="text-fire-600 hover:text-fire-700 font-bold text-sm transition-colors"
                    onClick={() => setUseManualAddress(false)}
                  >
                    ← Use GPS
                  </button>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    className="w-full px-4 py-3 border-2 border-fire-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium shadow-md"
                    placeholder="Enter your delivery address..."
                    rows={4}
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                  
                  <button 
                    className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
                    onClick={handleManualAddressSubmit}
                  >
                    Confirm Address
                  </button>
                </div>

                {locationData && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 space-y-2 shadow-lg">
                    <h4 className="text-lg font-bold text-green-800 flex items-center gap-2">
                      <span>✅</span> Address Confirmed
                    </h4>
                    <p className="text-gray-800 font-medium break-words">
                      {locationData.address}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Continue Button */}
      {locationData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
          <button 
            className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={!locationData}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}