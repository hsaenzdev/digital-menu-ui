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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-4">
      <div className="w-full sm:max-w-2xl sm:mx-auto py-4 sm:py-8">
        <div className="bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8 animate-fade-in">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <button 
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/')}
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              📍 Your Location
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              We need your location to calculate delivery time and fees
            </p>
          </div>

          {/* Location Content */}
          <div className="space-y-4 sm:space-y-6">
            {!useManualAddress ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-center">
                  <div className="text-5xl sm:text-6xl md:text-7xl animate-pulse-slow">🎯</div>
                </div>
                
                {loading && (
                  <div className="text-center space-y-3">
                    <p className="text-gray-600 font-medium text-sm sm:text-base">Getting your location...</p>
                    <div className="flex justify-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}

                {locationData && !loading && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-green-800 flex items-center gap-2">
                      <span>✅</span> Location Found
                    </h3>
                    <p className="text-gray-800 font-medium text-base sm:text-lg break-words">
                      {locationData.address}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 sm:p-4">
                    <p className="text-red-600 font-medium text-sm sm:text-base">❌ {error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    className="w-full bg-gradient-primary text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={getCurrentLocation}
                    disabled={loading}
                  >
                    {loading ? 'Getting Location...' : '📍 Use My Location'}
                  </button>
                  
                  <button 
                    className="w-full bg-white text-primary-600 border-2 border-primary-600 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-primary-50 transition-colors text-sm sm:text-base"
                    onClick={() => setUseManualAddress(true)}
                  >
                    📝 Enter Address Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">📝 Enter Your Address</h3>
                  <button 
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors self-start sm:self-auto"
                    onClick={() => setUseManualAddress(false)}
                  >
                    📍 Use GPS Instead
                  </button>
                </div>

                <div className="space-y-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Delivery Address
                  </label>
                  <textarea
                    id="address"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter your full address including street, city, and postal code"
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none text-gray-800 text-sm sm:text-base"
                  />
                  <button 
                    className="w-full bg-gradient-primary text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    onClick={handleManualAddressSubmit}
                  >
                    Confirm Address
                  </button>
                </div>

                {locationData && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 space-y-2">
                    <h4 className="text-base sm:text-lg font-bold text-green-800 flex items-center gap-2">
                      <span>✅</span> Address Confirmed
                    </h4>
                    <p className="text-gray-800 font-medium text-sm sm:text-base break-words">
                      {locationData.address}
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 sm:p-4">
                <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <button 
              className="w-full bg-gradient-primary text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleContinue}
              disabled={!locationData}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}