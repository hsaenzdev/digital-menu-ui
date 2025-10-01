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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-2 sm:p-4">
      <div className="w-full sm:max-w-2xl sm:mx-auto bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <button 
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors"
            onClick={() => navigate('/location')}
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">👤 Your Information</h1>
          <p className="text-gray-600">We need your contact details to process your order</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📍</span>
            <span className="text-gray-700 font-medium">{location.address}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {customer?.phoneNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📱</span>
                <span className="text-sm text-blue-800 font-medium">Phone Number:</span>
                <span className="text-blue-900">{customer.phoneNumber}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={customer?.name ? customer.name : "Enter your full name"}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {customer?.name && (
              <div className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                <span>✅</span>
                <span>Name on file: {customer.name}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading || !name}
            >
              {loading ? 'Processing...' : 'Continue to Menu →'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
            <span>🔒</span>
            <span>Your information is secure and will only be used for order processing</span>
          </p>
        </div>
      </div>
    </div>
  )
}