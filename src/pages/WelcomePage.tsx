import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext'
import type { Customer, ApiResponse } from '../types'

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { setCustomer } = useCustomer()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          // Customer exists - store in context
          setCustomer(data.data)
        } else {
          // Customer not found - this should not happen as WA creates customer first
          // But we'll handle it gracefully
          console.warn('Customer not found, will need to create')
        }
      } catch (err) {
        console.error('Error fetching customer:', err)
        setError('Failed to load customer information')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId, setCustomer])

  const handleStartOrder = () => {
    navigate('/customer-info')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-modal p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4 animate-pulse-slow">⏳</div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-modal p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-modal p-4 sm:p-6 md:p-8 w-full sm:max-w-2xl animate-fade-in">
        {/* Restaurant Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🍽️ Digital Menu
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Delicious food delivered to your door</p>
        </div>

        {/* Welcome Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Food Icon */}
          <div className="flex justify-center">
            <div className="text-6xl sm:text-7xl md:text-8xl filter drop-shadow-lg animate-pulse-slow">
              🍔🍟🥤
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Welcome to our restaurant!
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Order your favorite meals with just a few taps
            </p>
            
            {/* Features List */}
            <div className="grid gap-3 sm:gap-4 md:gap-6 mt-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                <span className="text-2xl sm:text-3xl">📱</span>
                <span className="text-gray-700 font-medium text-sm sm:text-base">Easy mobile ordering</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                <span className="text-2xl sm:text-3xl">🚚</span>
                <span className="text-gray-700 font-medium text-sm sm:text-base">Fast delivery</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                <span className="text-2xl sm:text-3xl">💳</span>
                <span className="text-gray-700 font-medium text-sm sm:text-base">Secure payment</span>
              </div>
            </div>
          </div>

          {/* Start Order Button */}
          <button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-card hover:shadow-card-hover transform hover:scale-105 transition-all duration-200"
            onClick={handleStartOrder}
          >
            Start Your Order
          </button>
          
          {/* Temporary test button for development */}
          <button 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-card transition-all duration-200 text-sm sm:text-base"
            onClick={() => navigate('/menu')}
          >
            🧪 Test Menu (Dev)
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center space-y-2 text-gray-600 text-sm sm:text-base">
          <p>🕐 Open daily: 10:00 AM - 10:00 PM</p>
          <p>📞 Questions? Call us at (555) 123-4567</p>
        </div>
      </div>
    </div>
  )
}