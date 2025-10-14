import React, { useState, useEffect } from 'react'
import { ManagerLayout } from '../../components/manager/ManagerLayout'
import { useAuth } from '../../context/AuthContext'

interface Customer {
  id: string
  platform: string
  phoneNumber?: string
  messengerPsid?: string
  name?: string
  email?: string
  birthday?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  orderCount: number
  totalSpent: number
}

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: number
  platform: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

const API_URL = '/api/customers'

export const CustomersManager: React.FC = () => {
  const { token } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Modal state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })

  // Fetch customers
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = customers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Platform filter
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(customer => customer.platform === filterPlatform)
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active'
      filtered = filtered.filter(customer => customer.isActive === isActive)
    }

    setFilteredCustomers(filtered)
  }, [customers, searchTerm, filterPlatform, filterStatus])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(API_URL)
      const data = await response.json()

      if (data.success) {
        setCustomers(data.data)
      } else {
        setError(data.error || 'Failed to load customers')
      }
    } catch (err) {
      setError('Failed to load customers')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const response = await fetch(`${API_URL}/${customerId}/orders`)
      const data = await response.json()

      if (data.success) {
        setCustomerOrders(data.data)
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err)
    }
  }

  const handleOpenCustomerModal = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditForm({ name: customer.name || '', email: customer.email || '' })
    setIsModalOpen(true)
    setIsEditMode(false)
    await fetchCustomerOrders(customer.id)
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return

    try {
      const response = await fetch(`${API_URL}/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        // Update customer in state
        setCustomers(prev =>
          prev.map(c => c.id === selectedCustomer.id ? { ...c, ...editForm } : c)
        )
        setSelectedCustomer({ ...selectedCustomer, ...editForm })
        setIsEditMode(false)
      } else {
        setError(data.error || 'Failed to update customer')
      }
    } catch (err) {
      setError('Failed to update customer')
      console.error(err)
    }
  }

  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/${customerId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        // Update customer in state
        setCustomers(prev =>
          prev.map(c => c.id === customerId ? { ...c, isActive: !currentStatus } : c)
        )
        
        // Update modal if it's open for this customer
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer({ ...selectedCustomer, isActive: !currentStatus })
        }
      } else {
        setError(data.error || 'Failed to toggle customer status')
      }
    } catch (err) {
      setError('Failed to toggle customer status')
      console.error(err)
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'messenger' ? '💬' : '📱'
  }

  const getPlatformLabel = (platform: string) => {
    return platform === 'messenger' ? 'Messenger' : 'WhatsApp'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate statistics
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    inactive: customers.filter(c => !c.isActive).length,
    whatsapp: customers.filter(c => c.platform === 'whatsapp').length,
    messenger: customers.filter(c => c.platform === 'messenger').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    totalOrders: customers.reduce((sum, c) => sum + c.orderCount, 0)
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-600">Manage your customer database</p>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Inactive</p>
            <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">📱 WhatsApp</p>
            <p className="text-2xl font-bold text-purple-900">{stats.whatsapp}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600 font-medium">💬 Messenger</p>
            <p className="text-2xl font-bold text-indigo-900">{stats.messenger}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-600 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-emerald-900">${stats.totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">Orders</p>
            <p className="text-2xl font-bold text-orange-900">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="messenger">Messenger</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Customers Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name || 'Guest'}
                        </div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getPlatformIcon(customer.platform)} {getPlatformLabel(customer.platform)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phoneNumber || customer.messengerPsid?.substring(0, 12) + '...'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {customer.orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">
                          ${customer.totalSpent.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                              customer.isActive
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {customer.isActive ? '🔒 Disable' : '✓ Enable'}
                          </button>
                          <button
                            onClick={() => handleOpenCustomerModal(customer)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-600">
                  {searchTerm || filterPlatform !== 'all' || filterStatus !== 'all'
                    ? 'No customers match your filters'
                    : 'No customers yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Customer Details Modal */}
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
                    <p className="text-sm text-gray-600">
                      {getPlatformIcon(selectedCustomer.platform)} {getPlatformLabel(selectedCustomer.platform)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleStatus(selectedCustomer.id, selectedCustomer.isActive)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCustomer.isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {selectedCustomer.isActive ? '🔒 Disable Customer' : '✓ Enable Customer'}
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Information</h3>
                      {!isEditMode ? (
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          ✏️ Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateCustomer}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditMode(false)
                              setEditForm({ name: selectedCustomer.name || '', email: selectedCustomer.email || '' })
                            }}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{selectedCustomer.name || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        {isEditMode ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{selectedCustomer.email || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <p className="text-gray-900">
                          {selectedCustomer.phoneNumber || selectedCustomer.messengerPsid}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedCustomer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCustomer.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <p className="text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <p className="text-gray-900">{formatDate(selectedCustomer.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-900">{selectedCustomer.orderCount}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Total Spent</p>
                      <p className="text-3xl font-bold text-green-900">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                    {customerOrders.length > 0 ? (
                      <div className="space-y-3">
                        {customerOrders.map((order) => (
                          <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <span className="font-bold text-green-600">${order.total.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>{formatDate(order.createdAt)}</p>
                              <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No orders yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  )
}
