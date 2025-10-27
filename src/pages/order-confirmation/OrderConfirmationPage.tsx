import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useCustomer } from '../../context/CustomerContext'
import { useBankSettings } from './useBankSettings'
import { useOrderSubmission } from './useOrderSubmission'
import { calculateTotal } from './orderUtils'
import {
  SuccessState,
  EmptyCartState,
  MissingCustomerInfoState,
  CustomerInfoCard,
  OrderItemsCard,
  OrderSummaryCard,
  PaymentMethodSelector,
  ErrorMessage
} from './components'
import type { PaymentMethod } from '../../types'

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const { cart, clearCart } = useCart()
  const { customer, location, customerLocationId } = useCustomer()
  const { bankSettings } = useBankSettings()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  const hasCartItems =
    cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0
  const hasCustomerInfo = customer?.id && customer?.name

  // Order submission with success callback
  const { submitOrder, submittedOrder, isSubmitting, error } = useOrderSubmission({
    onSuccess: (order, method) => {
      clearCart()
      if (method === 'bank_transfer') {
        navigate(`/${customerId}/payment-pending/${order.id}`)
      }
    }
  })

  // Calculate total
  const total = calculateTotal(cart?.subtotal ?? 0, cart?.tax ?? 0, cart?.tip ?? 0)

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!hasCartItems || !hasCustomerInfo || !customer?.id || !customerLocationId) return

    await submitOrder(
      cart!,
      customer.id,
      customerLocationId,
      paymentMethod
    )
  }

  // Success state - order was submitted
  if (submittedOrder) {
    return (
      <div className="flex flex-col h-screen-dvh bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 shadow-lg">
          <h1 className="text-lg font-bold">Order Complete</h1>
        </div>
        <SuccessState order={submittedOrder} customerName={customer?.name || 'Customer'} />
      </div>
    )
  }

  // Empty cart state
  if (!hasCartItems) {
    return (
      <div className="flex flex-col h-screen-dvh bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-fire-600 to-ember-600 text-white p-3 shadow-lg">
          <h1 className="text-lg font-bold">Order Confirmation</h1>
        </div>
        <EmptyCartState />
      </div>
    )
  }

  // No customer info state
  if (!hasCustomerInfo) {
    return (
      <div className="flex flex-col h-screen-dvh bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-fire-600 to-ember-600 text-white p-3 shadow-lg">
          <h1 className="text-lg font-bold">Order Confirmation</h1>
        </div>
        <MissingCustomerInfoState />
      </div>
    )
  }

  // Main order confirmation form
  return (
    <div className="flex flex-col h-screen-dvh bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-fire-600 to-ember-600 text-white p-3 shadow-lg">
        <h1 className="text-lg font-bold">Confirm Your Order</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-fire-50 to-white">
        <div className="p-3 pb-32 space-y-3">
          {/* Error Message */}
          {error && <ErrorMessage error={error} />}

          {/* Customer Info */}
          <CustomerInfoCard customer={customer} location={location} />

          {/* Order Items */}
          <OrderItemsCard items={cart.items} />

          {/* Order Summary */}
          <OrderSummaryCard cart={cart} total={total} />

          {/* Payment Method */}
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            bankSettings={bankSettings}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-2.5 shadow-2xl z-50">
        <button
          className={`w-full font-semibold text-sm py-2.5 px-4 rounded-lg transition-all shadow-lg ${
            isSubmitting
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-fire-600 to-ember-600 text-white hover:from-fire-700 hover:to-ember-700'
          }`}
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? '🔄 Placing Order...' : '🍔 Place Order'}
        </button>
      </div>
    </div>
  )
}
