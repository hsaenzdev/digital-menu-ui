import React, { useState, useEffect, useCallback } from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'
import { useAuth } from '../../context/AuthContext'

type Tab = 'restaurant' | 'hours' | 'pricing' | 'delivery' | 'orders' | 'notifications' | 'platforms' | 'appearance'

interface Settings {
  id: string
  // Restaurant Information
  restaurantName: string
  description?: string
  tagline?: string
  phone: string
  email: string
  address?: string
  logoUrl?: string
  coverImageUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  
  // Business Hours
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  specialHours: Array<{ date: string; name: string; closed: boolean; open?: string; close?: string }>
  leadTimeMinutes: number
  
  // Pricing & Fees
  taxRate: number
  serviceFeeType: 'fixed' | 'percentage'
  serviceFeeAmount: number
  minimumOrderAmount: number
  currencySymbol: string
  currencyCode: string
  tipSuggestions: number[]
  
  // Payment Methods
  bankTransferEnabled: boolean
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  bankTransferInstructions?: string
  
  // Delivery Settings
  baseDeliveryFee: number
  freeDeliveryThreshold?: number
  estimatedDeliveryMinutes: number
  estimatedDeliveryMaxMinutes: number
  maxDeliveryRadiusKm?: number
  defaultDeliveryInstructions?: string
  
  // Order Settings
  autoAcceptOrders: boolean
  maxOrdersPerHour?: number
  cancellationWindowMinutes: number
  averagePrepTimeMinutes: number
  allowSpecialInstructions: boolean
  requireCustomerPhone: boolean
  requireCustomerEmail: boolean
  
  // Notification Settings
  notificationSettings: {
    newOrder: { email: boolean; sms: boolean; whatsapp: boolean }
    dailyReport: { email: boolean; time: string }
    lowStock: { email: boolean }
    customerFeedback: { email: boolean }
  }
  
  // Platform Integrations
  whatsappEnabled: boolean
  whatsappPhoneNumber?: string
  whatsappApiToken?: string
  whatsappWelcomeMessage?: string
  messengerEnabled: boolean
  messengerPageId?: string
  messengerAccessToken?: string
  messengerWebhookUrl?: string
  
  // Appearance
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  theme: 'light' | 'dark'
  menuDisplayStyle: 'grid' | 'list'
  
  // Security
  twoFactorEnabled: boolean
}

export const SettingsPage: React.FC = () => {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('restaurant')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    if (!token) return
    
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load settings')
      }

      const data = await response.json()
      setSettings(data.settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [token])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async (updates: Partial<Settings>) => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const data = await response.json()
      setSettings(data.settings)
      setSuccessMessage('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateField = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  if (!settings) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600">Failed to load settings</p>
            <button
              onClick={loadSettings}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  const tabs = [
    { id: 'restaurant' as Tab, label: 'Restaurant Info', icon: '🏪' },
    { id: 'hours' as Tab, label: 'Business Hours', icon: '⏰' },
    { id: 'pricing' as Tab, label: 'Pricing & Fees', icon: '💰' },
    { id: 'delivery' as Tab, label: 'Delivery', icon: '🚚' },
    { id: 'orders' as Tab, label: 'Orders', icon: '🍽️' },
    { id: 'notifications' as Tab, label: 'Notifications', icon: '🔔' },
    { id: 'platforms' as Tab, label: 'Platforms', icon: '📱' },
    { id: 'appearance' as Tab, label: 'Appearance', icon: '🎨' },
  ]

  return (
    <ManagerLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 text-sm">Configure your restaurant settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <span className="text-red-600">✕</span>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              {/* Restaurant Information */}
              {activeTab === 'restaurant' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Restaurant Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                      <input
                        type="text"
                        value={settings.restaurantName}
                        onChange={(e) => updateField('restaurantName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settings.tagline || ''}
                        onChange={(e) => updateField('tagline', e.target.value)}
                        placeholder="Fresh Food, Made with Love"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={settings.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        placeholder="Tell customers about your restaurant..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          value={settings.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={settings.address || ''}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="123 Main Street, City, State 12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                        <input
                          type="url"
                          value={settings.instagramUrl || ''}
                          onChange={(e) => updateField('instagramUrl', e.target.value)}
                          placeholder="https://instagram.com/yourrestaurant"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                        <input
                          type="url"
                          value={settings.facebookUrl || ''}
                          onChange={(e) => updateField('facebookUrl', e.target.value)}
                          placeholder="https://facebook.com/yourrestaurant"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                      <input
                        type="url"
                        value={settings.websiteUrl || ''}
                        onChange={(e) => updateField('websiteUrl', e.target.value)}
                        placeholder="https://yourrestaurant.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          restaurantName: settings.restaurantName,
                          tagline: settings.tagline,
                          description: settings.description,
                          phone: settings.phone,
                          email: settings.email,
                          address: settings.address,
                          instagramUrl: settings.instagramUrl,
                          facebookUrl: settings.facebookUrl,
                          websiteUrl: settings.websiteUrl,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {activeTab === 'hours' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Business Hours</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Weekly Schedule</label>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const dayData = settings.businessHours[day] || { open: '11:00', close: '22:00', closed: false }
                        return (
                          <div key={day} className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-28 font-medium text-gray-700 capitalize">{day}</div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={dayData.closed}
                                onChange={(e) => {
                                  const newHours = { ...settings.businessHours }
                                  newHours[day] = { ...dayData, closed: e.target.checked }
                                  updateField('businessHours', newHours)
                                }}
                                className="rounded text-blue-500"
                              />
                              <span className="text-sm text-gray-600">Closed</span>
                            </label>
                            {!dayData.closed && (
                              <>
                                <input
                                  type="time"
                                  value={dayData.open}
                                  onChange={(e) => {
                                    const newHours = { ...settings.businessHours }
                                    newHours[day] = { ...dayData, open: e.target.value }
                                    updateField('businessHours', newHours)
                                  }}
                                  className="px-3 py-1 border border-gray-300 rounded"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={dayData.close}
                                  onChange={(e) => {
                                    const newHours = { ...settings.businessHours }
                                    newHours[day] = { ...dayData, close: e.target.value }
                                    updateField('businessHours', newHours)
                                  }}
                                  className="px-3 py-1 border border-gray-300 rounded"
                                />
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (minutes)</label>
                      <input
                        type="number"
                        value={settings.leadTimeMinutes}
                        onChange={(e) => updateField('leadTimeMinutes', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">Minimum time needed before an order can be ready</p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          businessHours: settings.businessHours,
                          leadTimeMinutes: settings.leadTimeMinutes,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing & Fees */}
              {activeTab === 'pricing' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing & Fees</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={settings.taxRate}
                          onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.minimumOrderAmount}
                          onChange={(e) => updateField('minimumOrderAmount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Fee Type</label>
                      <select
                        value={settings.serviceFeeType}
                        onChange={(e) => updateField('serviceFeeType', e.target.value as 'fixed' | 'percentage')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Fee {settings.serviceFeeType === 'fixed' ? 'Amount' : 'Percentage'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.serviceFeeAmount}
                        onChange={(e) => updateField('serviceFeeAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tip Suggestions (%)</label>
                      <div className="flex gap-2">
                        {settings.tipSuggestions.map((tip, index) => (
                          <input
                            key={index}
                            type="number"
                            value={tip}
                            onChange={(e) => {
                              const newTips = [...settings.tipSuggestions]
                              newTips[index] = parseInt(e.target.value) || 0
                              updateField('tipSuggestions', newTips)
                            }}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bank Transfer Payment Settings */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">🏦 Bank Transfer Payment</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="bankTransferEnabled"
                            checked={settings.bankTransferEnabled || false}
                            onChange={(e) => updateField('bankTransferEnabled', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="bankTransferEnabled" className="ml-2 text-sm font-medium text-gray-700">
                            Enable Bank Transfer as Payment Method
                          </label>
                        </div>

                        {settings.bankTransferEnabled && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                  type="text"
                                  value={settings.bankName || ''}
                                  onChange={(e) => updateField('bankName', e.target.value)}
                                  placeholder="e.g., Chase Bank"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                  type="text"
                                  value={settings.bankAccountNumber || ''}
                                  onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                                  placeholder="e.g., 1234567890"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                              <input
                                type="text"
                                value={settings.bankAccountHolder || ''}
                                onChange={(e) => updateField('bankAccountHolder', e.target.value)}
                                placeholder="e.g., Restaurant LLC"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Instructions</label>
                              <textarea
                                value={settings.bankTransferInstructions || ''}
                                onChange={(e) => updateField('bankTransferInstructions', e.target.value)}
                                placeholder="Please use your order number as the transfer reference..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          taxRate: settings.taxRate,
                          serviceFeeType: settings.serviceFeeType,
                          serviceFeeAmount: settings.serviceFeeAmount,
                          minimumOrderAmount: settings.minimumOrderAmount,
                          tipSuggestions: settings.tipSuggestions,
                          bankTransferEnabled: settings.bankTransferEnabled,
                          bankName: settings.bankName,
                          bankAccountNumber: settings.bankAccountNumber,
                          bankAccountHolder: settings.bankAccountHolder,
                          bankTransferInstructions: settings.bankTransferInstructions,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Settings */}
              {activeTab === 'delivery' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Delivery Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Delivery Fee</label>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.baseDeliveryFee}
                          onChange={(e) => updateField('baseDeliveryFee', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold</label>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.freeDeliveryThreshold || ''}
                          onChange={(e) => updateField('freeDeliveryThreshold', parseFloat(e.target.value) || undefined)}
                          placeholder="Leave empty for no free delivery"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Time (min)</label>
                        <input
                          type="number"
                          value={settings.estimatedDeliveryMinutes}
                          onChange={(e) => updateField('estimatedDeliveryMinutes', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Time (max)</label>
                        <input
                          type="number"
                          value={settings.estimatedDeliveryMaxMinutes}
                          onChange={(e) => updateField('estimatedDeliveryMaxMinutes', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Instructions</label>
                      <textarea
                        value={settings.defaultDeliveryInstructions || ''}
                        onChange={(e) => updateField('defaultDeliveryInstructions', e.target.value)}
                        rows={3}
                        placeholder="e.g., Ring doorbell, Call upon arrival..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          baseDeliveryFee: settings.baseDeliveryFee,
                          freeDeliveryThreshold: settings.freeDeliveryThreshold,
                          estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
                          estimatedDeliveryMaxMinutes: settings.estimatedDeliveryMaxMinutes,
                          defaultDeliveryInstructions: settings.defaultDeliveryInstructions,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Settings */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Order Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">Auto-Accept Orders</p>
                        <p className="text-sm text-gray-500">Automatically accept new orders without manual review</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoAcceptOrders}
                          onChange={(e) => updateField('autoAcceptOrders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Orders per Hour</label>
                        <input
                          type="number"
                          value={settings.maxOrdersPerHour || ''}
                          onChange={(e) => updateField('maxOrdersPerHour', parseInt(e.target.value) || undefined)}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Average Prep Time (minutes)</label>
                        <input
                          type="number"
                          value={settings.averagePrepTimeMinutes}
                          onChange={(e) => updateField('averagePrepTimeMinutes', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Window (minutes)</label>
                      <input
                        type="number"
                        value={settings.cancellationWindowMinutes}
                        onChange={(e) => updateField('cancellationWindowMinutes', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">Time window customers can cancel their order</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">Allow Special Instructions</p>
                        <p className="text-sm text-gray-500">Let customers add notes to their orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.allowSpecialInstructions}
                          onChange={(e) => updateField('allowSpecialInstructions', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">Require Customer Phone</p>
                        <p className="text-sm text-gray-500">Make phone number mandatory for orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.requireCustomerPhone}
                          onChange={(e) => updateField('requireCustomerPhone', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">Require Customer Email</p>
                        <p className="text-sm text-gray-500">Make email address mandatory for orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.requireCustomerEmail}
                          onChange={(e) => updateField('requireCustomerEmail', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          autoAcceptOrders: settings.autoAcceptOrders,
                          maxOrdersPerHour: settings.maxOrdersPerHour,
                          averagePrepTimeMinutes: settings.averagePrepTimeMinutes,
                          cancellationWindowMinutes: settings.cancellationWindowMinutes,
                          allowSpecialInstructions: settings.allowSpecialInstructions,
                          requireCustomerPhone: settings.requireCustomerPhone,
                          requireCustomerEmail: settings.requireCustomerEmail,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-3">New Order Alerts</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.notificationSettings.newOrder.email}
                            onChange={(e) => {
                              const newSettings = { ...settings.notificationSettings }
                              newSettings.newOrder.email = e.target.checked
                              updateField('notificationSettings', newSettings)
                            }}
                            className="rounded text-blue-500"
                          />
                          <span className="text-sm text-gray-600">Email notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.notificationSettings.newOrder.whatsapp}
                            onChange={(e) => {
                              const newSettings = { ...settings.notificationSettings }
                              newSettings.newOrder.whatsapp = e.target.checked
                              updateField('notificationSettings', newSettings)
                            }}
                            className="rounded text-blue-500"
                          />
                          <span className="text-sm text-gray-600">WhatsApp notifications</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-3">Daily Reports</h3>
                      <label className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={settings.notificationSettings.dailyReport.email}
                          onChange={(e) => {
                            const newSettings = { ...settings.notificationSettings }
                            newSettings.dailyReport.email = e.target.checked
                            updateField('notificationSettings', newSettings)
                          }}
                          className="rounded text-blue-500"
                        />
                        <span className="text-sm text-gray-600">Send daily summary via email</span>
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Time</label>
                        <input
                          type="time"
                          value={settings.notificationSettings.dailyReport.time}
                          onChange={(e) => {
                            const newSettings = { ...settings.notificationSettings }
                            newSettings.dailyReport.time = e.target.value
                            updateField('notificationSettings', newSettings)
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          notificationSettings: settings.notificationSettings,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Integrations */}
              {activeTab === 'platforms' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Platform Integrations</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-700">WhatsApp Integration</h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.whatsappEnabled}
                            onChange={(e) => updateField('whatsappEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                      {settings.whatsappEnabled && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              value={settings.whatsappPhoneNumber || ''}
                              onChange={(e) => updateField('whatsappPhoneNumber', e.target.value)}
                              placeholder="+1234567890"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                            <textarea
                              value={settings.whatsappWelcomeMessage || ''}
                              onChange={(e) => updateField('whatsappWelcomeMessage', e.target.value)}
                              rows={3}
                              placeholder="Welcome! How can we help you today?"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-700">Messenger Integration</h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.messengerEnabled}
                            onChange={(e) => updateField('messengerEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                      {settings.messengerEnabled && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page ID</label>
                            <input
                              type="text"
                              value={settings.messengerPageId || ''}
                              onChange={(e) => updateField('messengerPageId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          whatsappEnabled: settings.whatsappEnabled,
                          whatsappPhoneNumber: settings.whatsappPhoneNumber,
                          whatsappWelcomeMessage: settings.whatsappWelcomeMessage,
                          messengerEnabled: settings.messengerEnabled,
                          messengerPageId: settings.messengerPageId,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Appearance Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => updateField('primaryColor', e.target.value)}
                            className="h-10 w-16 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) => updateField('primaryColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) => updateField('secondaryColor', e.target.value)}
                            className="h-10 w-16 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor}
                            onChange={(e) => updateField('secondaryColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => updateField('fontFamily', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Open Sans">Open Sans</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => updateField('theme', e.target.value as 'light' | 'dark')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Menu Display Style</label>
                      <select
                        value={settings.menuDisplayStyle}
                        onChange={(e) => updateField('menuDisplayStyle', e.target.value as 'grid' | 'list')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="grid">Grid</option>
                        <option value="list">List</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveSettings({
                          primaryColor: settings.primaryColor,
                          secondaryColor: settings.secondaryColor,
                          fontFamily: settings.fontFamily,
                          theme: settings.theme,
                          menuDisplayStyle: settings.menuDisplayStyle,
                        })}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
