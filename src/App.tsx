import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage'
import { MenuPage } from './pages/MenuPage'
import { CartPage } from './pages/CartPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { PaymentPendingPage } from './pages/PaymentPendingPage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { OrderHistoryPage } from './pages/OrderHistoryPage'
import { CartProvider } from './context/CartContext'
import { CustomerProvider } from './context/CustomerContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/manager/ProtectedRoute'
import { CustomerGuard } from './components/CustomerGuard'

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { ManagerLogin } from './pages/manager/ManagerLogin'
import { OrdersManager } from './pages/manager/OrdersManager'
import { MenuManager } from './pages/manager/MenuManager'
import { CustomersManager } from './pages/manager/CustomersManager'
import { DeliveryZonesManager } from './pages/manager/DeliveryZonesManager'
import { AnalyticsPage } from './pages/manager/AnalyticsPage'
import { SettingsPage } from './pages/manager/SettingsPage'

// Validation Error Pages
import {
  CustomerNotFoundPage,
  CustomerDisabledPage,
  RestaurantClosedPage,
  OutsideCityPage,
  OutsideZonePage,
  NoLocationPermissionPage,
  NoGeolocationSupportPage,
  GenericErrorPage
} from './pages/validation-errors'

function App() {
  return (
    <Router>
      <CustomerProvider>
        <CartProvider>
          <AuthProvider>
            <div className="min-h-screen w-full bg-white">
              <Routes>
                {/* Manager Routes - Login is public, rest are protected */}
                <Route path="/manager/login" element={<ManagerLogin />} />
                <Route path="/manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
                <Route path="/manager/orders" element={<ProtectedRoute><OrdersManager /></ProtectedRoute>} />
                <Route path="/manager/menu" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
                <Route path="/manager/customers" element={<ProtectedRoute><CustomersManager /></ProtectedRoute>} />
                <Route path="/manager/zones" element={<ProtectedRoute><DeliveryZonesManager /></ProtectedRoute>} />
                <Route path="/manager/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/manager/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Validation Error Routes - Customer-agnostic errors (no customerId needed) */}
                <Route path="/error/customer-not-found" element={<CustomerNotFoundPage />} />

                {/* Customer Routes - All include customerId */}
                <Route path="/:customerId" element={<CustomerGuard><WelcomePage /></CustomerGuard>} />
                <Route path="/:customerId/menu" element={<CustomerGuard><MenuPage /></CustomerGuard>} />
                <Route path="/:customerId/cart" element={<CustomerGuard><CartPage /></CustomerGuard>} />
                <Route path="/:customerId/order-confirmation" element={<CustomerGuard><OrderConfirmationPage /></CustomerGuard>} />
                <Route path="/:customerId/payment-pending/:orderId" element={<CustomerGuard><PaymentPendingPage /></CustomerGuard>} />
                <Route path="/:customerId/order-status/:orderId" element={<CustomerGuard><OrderStatusPage /></CustomerGuard>} />
                <Route path="/:customerId/orders" element={<CustomerGuard><OrderHistoryPage /></CustomerGuard>} />
                
                {/* Customer-Specific Validation Error Routes (customerId required) */}
                <Route path="/:customerId/error/customer-disabled" element={<CustomerDisabledPage />} />
                <Route path="/:customerId/error/restaurant-closed" element={<RestaurantClosedPage />} />
                <Route path="/:customerId/error/outside-city" element={<OutsideCityPage />} />
                <Route path="/:customerId/error/outside-zone" element={<OutsideZonePage />} />
                <Route path="/:customerId/error/no-location-permission" element={<NoLocationPermissionPage />} />
                <Route path="/:customerId/error/no-geolocation-support" element={<NoGeolocationSupportPage />} />
                <Route path="/:customerId/error/generic" element={<GenericErrorPage />} />

                {/* Catch-all for invalid routes - show error */}
                <Route path="/:customerId" element={<CustomerGuard><WelcomePage /></CustomerGuard>} />
                <Route path="/:customerId/menu" element={<CustomerGuard><MenuPage /></CustomerGuard>} />
                <Route path="/:customerId/cart" element={<CustomerGuard><CartPage /></CustomerGuard>} />
                <Route path="/:customerId/order-confirmation" element={<CustomerGuard><OrderConfirmationPage /></CustomerGuard>} />
                <Route path="/:customerId/payment-pending/:orderId" element={<CustomerGuard><PaymentPendingPage /></CustomerGuard>} />
                <Route path="/:customerId/order-status/:orderId" element={<CustomerGuard><OrderStatusPage /></CustomerGuard>} />
                <Route path="/:customerId/orders" element={<CustomerGuard><OrderHistoryPage /></CustomerGuard>} />
                
                {/* Catch-all for invalid routes - show error */}
                <Route path="*" element={
                  <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-md">
                        <div className="text-8xl mb-6">🔗</div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
                          Invalid Link
                        </h2>
                        <p className="text-white/90 text-lg mb-6 drop-shadow">
                          This link is not valid. Please use the personalized link sent to you.
                        </p>
                        
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
                          <p className="text-white/80 text-sm mb-2">
                            <span className="font-semibold">How to order:</span>
                          </p>
                          <ol className="text-white/70 text-xs text-left space-y-1">
                            <li>1. Contact us via WhatsApp or Messenger</li>
                            <li>2. Receive your personalized order link</li>
                            <li>3. Click the link to start ordering</li>
                          </ol>
                        </div>

                        <div className="text-white/80 text-sm">
                          <p className="mb-2">📞 Contact us:</p>
                          <p className="text-white/60 text-xs">(555) 123-4567</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </AuthProvider>
        </CartProvider>
      </CustomerProvider>
    </Router>
  )
}

export default App
