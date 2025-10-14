import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { LocationData } from '../types'

export const CustomerSetupPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer, setCustomer, setLocation } = useCustomer()
  
  // Location state
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [address, setAddress] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  
  // Customer info state
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Ref to prevent duplicate geocoding calls (React StrictMode causes double mount)
  const hasCalledGeolocation = useRef(false)

  // Pre-fill name if customer already has one
  useEffect(() => {
    if (customer?.name) {
      setName(customer.name)
    }
  }, [customer])

  // Auto-fetch location on mount (only once)
  useEffect(() => {
    if (!hasCalledGeolocation.current) {
      hasCalledGeolocation.current = true
      getCurrentLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCurrentLocation = async () => {
    if (locationLoading) return
    
    setLocationLoading(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const response = await fetch(
            `http://localhost:3000/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
          )
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.success && data.address) {
              setAddress(data.address)
              setLocationData({
                latitude,
                longitude,
                address: data.address
              })
              setLocationError('')
            } else {
              setLocationError(data.message || 'Could not get address. Please enter manually.')
              setLocationData({
                latitude,
                longitude,
                address: ''
              })
            }
          } else {
            setLocationError('Could not get address. Please enter manually.')
            setLocationData({
              latitude,
              longitude,
              address: ''
            })
          }
          
          setLocationLoading(false)
        } catch {
          setLocationError('Could not get address. Please enter manually.')
          setLocationData({
            latitude,
            longitude,
            address: ''
          })
          setLocationLoading(false)
        }
      },
      (error) => {
        let errorMsg = 'Location access denied'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied. Please enter your address manually.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location unavailable. Please enter your address manually.'
            break
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Please enter your address manually.'
            break
        }
        
        setLocationError(errorMsg)
        setLocationLoading(false)
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
      setError('Please enter your name')
      return
    }

    if (!address.trim()) {
      setError('Please provide your delivery address')
      return
    }

    if (!customer?.id) {
      setError('No customer ID available. Please start from the link provided.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const finalLocation: LocationData = locationData && locationData.latitude !== 0 
        ? { ...locationData, address: address.trim() }
        : {
            latitude: 0,
            longitude: 0,
            address: address.trim()
          }

      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update customer')
      }

      setCustomer({
        ...customer,
        name: name.trim()
      })
      setLocation(finalLocation)

      navigate('/menu')
    } catch {
      setError('Failed to save information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-3 shadow-lg">
        <button 
          className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors mb-2"
          onClick={() => navigate(-1)}
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold drop-shadow-md">🚀 Let's Get Started</h1>
        <p className="text-fire-100 text-xs mt-1">Just a few details to begin your order</p>
      </div>

      {/* Main Content - No Scroll Needed */}
      <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-orange-50 to-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input - Top Priority */}
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-fire-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">�</span>
              <label htmlFor="name" className="font-bold text-gray-800">
                Your Name
              </label>
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={customer?.name || "Enter your full name"}
              required
              className="w-full px-3 py-2.5 border-2 border-fire-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium text-base"
            />
            {customer?.name && (
              <div className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1.5 bg-green-50 border border-green-300 rounded-lg p-1.5">
                <span>✅</span>
                <span>Saved: {customer.name}</span>
              </div>
            )}
          </div>

          {/* Location Input - Compact */}
          <div className="bg-white rounded-xl shadow-md p-4 border-2 border-fire-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <label className="font-bold text-gray-800">
                  Delivery Address
                </label>
              </div>
              {locationData && locationData.latitude !== 0 && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">GPS ✓</span>
              )}
            </div>

            {locationLoading && (
              <div className="flex items-center justify-center gap-2 mb-3 py-2">
                <div className="w-5 h-5 border-3 border-fire-200 border-t-fire-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm font-medium">Getting location...</p>
              </div>
            )}

            <textarea
              className="w-full px-3 py-2.5 border-2 border-fire-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium resize-none text-base"
              placeholder="Enter your street address (e.g., 123 Main St, Apt 4B)"
              rows={3}
              value={address}
              onChange={handleAddressChange}
              disabled={locationLoading}
              required
            />
            
            <button 
              type="button"
              className="w-full mt-2 bg-fire-50 text-fire-700 border-2 border-fire-300 font-semibold py-2 px-3 rounded-lg hover:bg-fire-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? '⏳ Getting...' : '📍 Use My Location'}
            </button>

            {locationError && (
              <div className="mt-2 bg-amber-50 border border-amber-300 rounded-lg p-2">
                <p className="text-amber-700 font-medium text-xs">💡 {locationError}</p>
              </div>
            )}
            
            {!address.trim() && !locationLoading && (
              <div className="mt-2 bg-blue-50 border border-blue-300 rounded-lg p-2">
                <p className="text-blue-700 font-medium text-xs">ℹ️ Click "Use My Location" or enter your address manually</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span className="text-red-700 font-semibold text-sm">{error}</span>
            </div>
          )}
        </form>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4">
          {/* Security Notice */}
          <p className="text-xs text-gray-600 font-medium flex items-center justify-center gap-1.5">
            <span className="text-sm">🔒</span>
            <span>Your information is secure</span>
          </p>

          {/* Submit Button */}
          <button 
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-base py-3.5 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={saving || !name.trim() || !address.trim() || locationLoading}
          >
            {saving ? '⏳ Saving...' : 
             !name.trim() ? 'Enter Your Name ↑' :
             !address.trim() ? 'Enter Delivery Address ↑' :
             'Continue to Menu →'}
          </button>
          
          {(!name.trim() || !address.trim()) && !saving && (
            <p className="text-xs text-center text-gray-600 -mt-1">
              Please complete all fields above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
