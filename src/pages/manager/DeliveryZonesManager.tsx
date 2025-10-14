import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression, LatLng } from 'leaflet'
import { ManagerLayout } from '../../components/manager/ManagerLayout'
import { useAuth } from '../../context/AuthContext'
import L from 'leaflet'

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface DeliveryZone {
  id: string
  cityId: string
  cityName: string
  name: string
  description?: string
  boundary: {
    type: string
    coordinates: number[][][]
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface City {
  id: string
  name: string
  country: string
  state?: string
  centerPoint?: {
    type: string
    coordinates: [number, number]
  }
  isActive: boolean
}

const API_URL = '/api/zones-manager'

// Component to handle drawing mode
const DrawingHandler: React.FC<{
  isDrawing: boolean
  onPointAdded: (latlng: LatLng) => void
}> = ({ isDrawing, onPointAdded }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onPointAdded(e.latlng)
      }
    }
  })
  return null
}

// Component to fit map bounds
const MapBounds: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export const DeliveryZonesManager: React.FC = () => {
  const { token } = useAuth()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Map state
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([25.6866, -100.3161]) // Monterrey, Mexico
  const [mapZoom, setMapZoom] = useState(12)
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState<LatLng[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newZoneData, setNewZoneData] = useState({
    cityId: '',
    name: '',
    description: ''
  })
  
  // Test location state
  const [testMode, setTestMode] = useState(false)
  const [testPoint, setTestPoint] = useState<LatLng | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)
  
  // Filters
  const [filterCity, setFilterCity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [zonesRes, citiesRes] = await Promise.all([
        fetch(`${API_URL}/zones`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/cities`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const zonesData = await zonesRes.json()
      const citiesData = await citiesRes.json()

      if (zonesData.success) setZones(zonesData.data)
      if (citiesData.success) setCities(citiesData.data)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartDrawing = () => {
    if (cities.length === 0) {
      setError('No cities available. Please add a city first.')
      return
    }
    setIsDrawing(true)
    setDrawingPoints([])
    setShowCreateModal(true)
  }

  const handlePointAdded = (latlng: LatLng) => {
    setDrawingPoints([...drawingPoints, latlng])
  }

  const handleCancelDrawing = () => {
    setIsDrawing(false)
    setDrawingPoints([])
    setShowCreateModal(false)
    setNewZoneData({ cityId: '', name: '', description: '' })
  }

  const handleCreateZone = async () => {
    if (!newZoneData.cityId || !newZoneData.name || drawingPoints.length < 3) {
      setError('Please fill all required fields and draw at least 3 points')
      return
    }

    try {
      const coordinates = drawingPoints.map(p => [p.lng, p.lat])
      
      const response = await fetch(`${API_URL}/zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newZoneData,
          coordinates
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchData()
        handleCancelDrawing()
      } else {
        setError(data.error || 'Failed to create zone')
      }
    } catch (err) {
      setError('Failed to create zone')
      console.error(err)
    }
  }

  const handleToggleZone = async (zoneId: string) => {
    try {
      const response = await fetch(`${API_URL}/zones/${zoneId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setZones(prev =>
          prev.map(z => z.id === zoneId ? { ...z, isActive: data.data.isActive } : z)
        )
        if (selectedZone && selectedZone.id === zoneId) {
          setSelectedZone({ ...selectedZone, isActive: data.data.isActive })
        }
      } else {
        setError(data.error || 'Failed to toggle zone')
      }
    } catch (err) {
      setError('Failed to toggle zone')
      console.error(err)
    }
  }

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return

    try {
      const response = await fetch(`${API_URL}/zones/${zoneId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setZones(prev => prev.filter(z => z.id !== zoneId))
        if (selectedZone && selectedZone.id === zoneId) {
          setSelectedZone(null)
        }
      } else {
        setError(data.error || 'Failed to delete zone')
      }
    } catch (err) {
      setError('Failed to delete zone')
      console.error(err)
    }
  }

  const handleTestLocation = async () => {
    if (!testPoint || !selectedZone) return

    try {
      const response = await fetch(`${API_URL}/test-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zoneId: selectedZone.id,
          latitude: testPoint.lat,
          longitude: testPoint.lng
        })
      })

      const data = await response.json()

      if (data.success) {
        setTestResult(data.data.message)
      } else {
        setTestResult(data.error || 'Test failed')
      }
    } catch (err) {
      setTestResult('Failed to test location')
      console.error(err)
    }
  }

  const handleZoomToZone = (zone: DeliveryZone) => {
    const coords = zone.boundary.coordinates[0]
    if (coords && coords.length > 0) {
      const lats = coords.map(c => c[1])
      const lngs = coords.map(c => c[0])
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2
      const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2
      setMapCenter([centerLat, centerLng])
      setMapZoom(14)
    }
  }

  // Apply filters
  const filteredZones = zones.filter(zone => {
    const matchesCity = filterCity === 'all' || zone.cityId === filterCity
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && zone.isActive) ||
      (filterStatus === 'inactive' && !zone.isActive)
    return matchesCity && matchesStatus
  })

  // Statistics
  const stats = {
    total: zones.length,
    active: zones.filter(z => z.isActive).length,
    inactive: zones.filter(z => !z.isActive).length,
    byCities: cities.map(city => ({
      name: city.name,
      count: zones.filter(z => z.cityId === city.id).length
    })).filter(c => c.count > 0)
  }

  const getPolygonColor = (zone: DeliveryZone) => {
    if (selectedZone && selectedZone.id === zone.id) {
      return { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3 }
    }
    return zone.isActive
      ? { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }
      : { color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.1 }
  }

  if (isLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="h-full flex flex-col space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
            <p className="text-sm text-gray-600">Manage delivery zones on the map</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStartDrawing}
              disabled={isDrawing}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDrawing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              ➕ Create Zone
            </button>
            <button
              onClick={() => {
                setTestMode(!testMode)
                setTestPoint(null)
                setTestResult(null)
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                testMode
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {testMode ? '✕ Cancel Test' : '📍 Test Location'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Zones</p>
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
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Zones List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
            <div className="space-y-3 mb-4">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredZones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>No zones yet</p>
                </div>
              ) : (
                filteredZones.map(zone => (
                  <div
                    key={zone.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedZone && selectedZone.id === zone.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedZone(zone)
                      handleZoomToZone(zone)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                        <p className="text-sm text-gray-600">{zone.cityName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        zone.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {zone.isActive ? '✓ Active' : '✕ Inactive'}
                      </span>
                    </div>
                    {zone.description && (
                      <p className="text-sm text-gray-500 mb-2">{zone.description}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleZone(zone.id)
                        }}
                        className={`flex-1 px-2 py-1 text-xs rounded font-medium ${
                          zone.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {zone.isActive ? '🔒 Disable' : '✓ Enable'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteZone(zone.id)
                        }}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded font-medium hover:bg-red-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden relative">
            {testMode && selectedZone && (
              <div className="absolute top-4 left-4 right-4 z-[1000] bg-orange-100 border-2 border-orange-500 rounded-lg p-3">
                <p className="font-medium text-orange-900 mb-2">
                  📍 Click on the map to test if the location is inside "{selectedZone.name}"
                </p>
                {testPoint && (
                  <div className="space-y-2">
                    <p className="text-sm text-orange-800">
                      Testing: {testPoint.lat.toFixed(6)}, {testPoint.lng.toFixed(6)}
                    </p>
                    <button
                      onClick={handleTestLocation}
                      className="px-3 py-1 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 text-sm"
                    >
                      Test Location
                    </button>
                    {testResult && (
                      <p className="text-sm font-medium text-orange-900">{testResult}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <MapBounds center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <DrawingHandler
                isDrawing={isDrawing || testMode}
                onPointAdded={(latlng) => {
                  if (isDrawing) {
                    handlePointAdded(latlng)
                  } else if (testMode) {
                    setTestPoint(latlng)
                    setTestResult(null)
                  }
                }}
              />

              {/* Existing zones */}
              {filteredZones.map(zone => {
                const coords: LatLngExpression[] = zone.boundary.coordinates[0].map(
                  c => [c[1], c[0]] as LatLngExpression
                )
                return (
                  <Polygon
                    key={zone.id}
                    positions={coords}
                    pathOptions={getPolygonColor(zone)}
                    eventHandlers={{
                      click: () => {
                        setSelectedZone(zone)
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{zone.name}</h3>
                        <p className="text-sm text-gray-600">{zone.cityName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {zone.isActive ? '✓ Active' : '✕ Inactive'}
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                )
              })}

              {/* Drawing polygon preview */}
              {isDrawing && drawingPoints.length > 0 && (
                <>
                  {drawingPoints.map((point, index) => (
                    <Marker key={index} position={point}>
                      <Popup>Point {index + 1}</Popup>
                    </Marker>
                  ))}
                  {drawingPoints.length >= 2 && (
                    <Polygon
                      positions={drawingPoints.map(p => [p.lat, p.lng] as LatLngExpression)}
                      pathOptions={{
                        color: '#8b5cf6',
                        fillColor: '#8b5cf6',
                        fillOpacity: 0.2,
                        dashArray: '10, 10'
                      }}
                    />
                  )}
                </>
              )}

              {/* Test point marker */}
              {testMode && testPoint && (
                <Marker position={testPoint}>
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold">Test Point</p>
                      <p className="text-xs text-gray-600">
                        {testPoint.lat.toFixed(6)}, {testPoint.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Create Zone Sidebar - Fixed to right side, doesn't block map */}
        {showCreateModal && (
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-[2000] border-l-4 border-indigo-500 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Delivery Zone</h2>
                <button
                  onClick={handleCancelDrawing}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    ✏️ Drawing Mode Active
                  </p>
                  <p className="text-sm text-blue-800 mb-2">
                    Click on the map to add points to your delivery zone polygon.
                  </p>
                  <div className="bg-white rounded px-3 py-2 border border-blue-300">
                    <p className="text-lg font-bold text-blue-900">
                      {drawingPoints.length} point{drawingPoints.length !== 1 ? 's' : ''} drawn
                    </p>
                    {drawingPoints.length < 3 && (
                      <p className="text-xs text-blue-700 mt-1">
                        Minimum 3 points required
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <select
                    value={newZoneData.cityId}
                    onChange={(e) => setNewZoneData({ ...newZoneData, cityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a city</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    value={newZoneData.name}
                    onChange={(e) => setNewZoneData({ ...newZoneData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Downtown Area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newZoneData.description}
                    onChange={(e) => setNewZoneData({ ...newZoneData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of the zone"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-2">💡 Tips:</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Zoom in for precision</li>
                    <li>• Click around the boundary</li>
                    <li>• 3+ points needed</li>
                    <li>• Auto-closes polygon</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={handleCreateZone}
                  disabled={!newZoneData.cityId || !newZoneData.name || drawingPoints.length < 3}
                  className={`w-full px-4 py-3 rounded-lg font-medium ${
                    !newZoneData.cityId || !newZoneData.name || drawingPoints.length < 3
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  ✓ Create Zone ({drawingPoints.length} points)
                </button>
                <button
                  onClick={handleCancelDrawing}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  ✕ Cancel Drawing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  )
}
