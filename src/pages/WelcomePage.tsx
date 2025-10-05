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
        }
      } catch {
        setError('Failed to load customer information')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId, setCustomer])

  const handleStartOrder = () => {
    navigate('/location')
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
            <div className="text-7xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-2">Error</h3>
            <p className="text-white/90 text-lg drop-shadow">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-32 space-y-4"> {/* Bottom padding for fixed button */}
          
          {/* Welcome Message */}
          <div className="text-center space-y-2 px-4 pt-2">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              Welcome to our restaurant!
            </h2>
            <p className="text-white/95 text-base font-medium drop-shadow">
              Order your favorite meals with just a few taps
            </p>
          </div>
          
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