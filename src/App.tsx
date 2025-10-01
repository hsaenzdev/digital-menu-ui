import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage'
import { LocationPage } from './pages/LocationPage'
import { CustomerInfoPage } from './pages/CustomerInfoPage'
import { MenuPage } from './pages/MenuPage'
import { CartPage } from './pages/CartPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { OrderHistoryPage } from './pages/OrderHistoryPage'
import { DebugPage } from './pages/DebugPage'
import { CartProvider } from './context/CartContext'
import { CustomerProvider } from './context/CustomerContext'

function App() {
  return (
    <CustomerProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen w-full bg-white">
            <Routes>
              <Route path="/:customerId" element={<WelcomePage />} />
              <Route path="/location" element={<LocationPage />} />
              <Route path="/customer-info" element={<CustomerInfoPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/debug" element={<DebugPage />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </CustomerProvider>
  )
}

export default App
