import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage'
import { CustomerSetupPage } from './pages/CustomerSetupPage'
import { MenuPage } from './pages/MenuPage'
import { CartPage } from './pages/CartPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { OrderHistoryPage } from './pages/OrderHistoryPage'
import { CartProvider } from './context/CartContext'
import { CustomerProvider } from './context/CustomerContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/manager/ProtectedRoute'

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { ManagerLogin } from './pages/manager/ManagerLogin'
import { OrdersManager } from './pages/manager/OrdersManager'
import { MenuManager } from './pages/manager/MenuManager'
import { CustomersManager } from './pages/manager/CustomersManager'
import { DeliveryZonesManager } from './pages/manager/DeliveryZonesManager'
import { AnalyticsPage } from './pages/manager/AnalyticsPage'
import { SettingsPage } from './pages/manager/SettingsPage'

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

                {/* Customer Routes */}
                <Route path="/:customerId" element={<WelcomePage />} />
                <Route path="/setup" element={<CustomerSetupPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                
                {/* Fallback for root path */}
                <Route path="/" element={<WelcomePage />} />
              </Routes>
            </div>
          </AuthProvider>
        </CartProvider>
      </CustomerProvider>
    </Router>
  )
}

export default App
