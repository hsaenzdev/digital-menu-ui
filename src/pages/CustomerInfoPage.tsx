import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'

export const CustomerInfoPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer, location, setCustomer } = useCustomer()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if no location
  useEffect(() => {
    if (!location) {
      navigate('/location')
    }
  }, [location, navigate])

  // Redirect if no customer (should come from URL)
  useEffect(() => {
    if (!customer) {
      // No customer loaded from URL - shouldn't happen in normal flow
      setError('No customer information available. Please start from the link provided.')
    }
  }, [customer])

  // Pre-fill name if customer already has one
  useEffect(() => {
    if (customer?.name) {
      setName(customer.name)
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name) {
      setError('Please enter your name')
      return
    }

    if (!customer?.id) {
      setError('No customer ID available. Please start from the link provided.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Update customer with name if it's new or changed
      if (!customer.name || customer.name !== name.trim()) {
        const response = await fetch(`/api/customers/${customer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            defaultAddress: location?.address || '',
            defaultLocation: `${location?.latitude},${location?.longitude}`
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update customer')
        }
      }

      // Update customer context with name
      setCustomer({
        ...customer,
        name: name.trim()
      })

      navigate('/menu')
    } catch {
      setError('Failed to save customer information')
    } finally {
      setLoading(false)
    }
  }

  if (!location) {
    return <div>Redirecting...</div>
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-4 py-4 shadow-lg">
        <button 
          className="text-white hover:text-fire-100 font-medium flex items-center gap-2 transition-colors mb-3"
          onClick={() => navigate('/location')}
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">👤 Your Information</h1>
        <p className="text-fire-100 text-sm mt-1">We need your contact details to process your order</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-4 pb-32">{/* Extra bottom padding for fixed button */}

          {/* Location Display */}
          <div className="bg-gradient-to-r from-fire-50 to-ember-50 border-2 border-fire-300 rounded-2xl p-4 mb-6 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="text-gray-800 font-medium">{location.address}</span>
            </div>
          </div>

          {/* Phone Number Display */}
          {customer?.phoneNumber && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-4 mb-6 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <span className="text-sm text-blue-800 font-bold">Phone:</span>
                <span className="text-blue-900 font-medium">{customer.phoneNumber}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="name" className="block text-base font-bold text-gray-800">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={customer?.name ? customer.name : "Enter your full name"}
                required
                className="w-full px-4 py-3 border-2 border-fire-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-fire-500 focus:border-transparent font-medium shadow-md text-lg"
              />
              {customer?.name && (
                <div className="mt-2 text-sm text-green-700 font-medium flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg p-2">
                  <span>✅</span>
                  <span>Name on file: {customer.name}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center gap-2 shadow-md">
                <span className="text-xl">❌</span>
                <span className="text-red-700 font-bold">{error}</span>
              </div>
            )}
          </form>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
              <span className="text-lg">🔒</span>
              <span>Your information is secure and only used for orders</span>
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-4 shadow-2xl z-50">
        <button 
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !name}
        >
          {loading ? '⏳ Processing...' : 'Continue to Menu →'}
        </button>
      </div>
    </div>
  )
}