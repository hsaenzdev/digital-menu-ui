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
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-md">
            {/* Restaurant Header */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 drop-shadow-2xl">🔥</div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-3">
                Digital Menu
              </h1>
              <p className="text-white/90 text-xl font-bold drop-shadow">Hot food delivered fresh to your door!</p>
            </div>

            {/* Welcome Content - White Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 space-y-6">
              {/* Food Icon */}
              <div className="flex justify-center">
                <div className="text-7xl filter drop-shadow-lg animate-pulse-slow">
                  🍔🍟🥤
                </div>
              </div>

              {/* Welcome Text */}
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome to our restaurant!
                </h2>
                <p className="text-gray-600 text-lg">
                  Order your favorite meals with just a few taps
                </p>
                
                {/* Features List */}
                <div className="grid gap-3 mt-6">
                  <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-fire-50 to-amber-50 rounded-xl border-2 border-fire-200 shadow-md">
                    <span className="text-3xl">📱</span>
                    <span className="text-gray-700 font-bold">Easy mobile ordering</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-fire-50 to-amber-50 rounded-xl border-2 border-fire-200 shadow-md">
                    <span className="text-3xl">🚚</span>
                    <span className="text-gray-700 font-bold">Fast delivery</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-fire-50 to-amber-50 rounded-xl border-2 border-fire-200 shadow-md">
                    <span className="text-3xl">💳</span>
                    <span className="text-gray-700 font-bold">Secure payment</span>
                  </div>
                </div>
              </div>

              {/* Start Order Button */}
              <button 
                className="w-full bg-gradient-to-r from-fire-500 to-ember-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:from-fire-600 hover:to-ember-600 transform active:scale-95 transition-all"
                onClick={handleStartOrder}
              >
                🔥 Start Your Order
              </button>
              
              {/* Temporary test button for development */}
              <button 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all"
                onClick={() => navigate('/menu')}
              >
                🧪 Test Menu (Dev)
              </button>

              {/* Footer */}
              <div className="pt-6 border-t-2 border-fire-200 text-center space-y-2 text-gray-600 font-medium">
                <p>🕐 Open daily: 10:00 AM - 10:00 PM</p>
                <p>📞 Questions? Call us at (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}