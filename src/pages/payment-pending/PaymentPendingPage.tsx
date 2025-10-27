import React from 'react'
import { useParams } from 'react-router-dom'
import { usePaymentPolling } from './usePaymentPolling'
import { useBankSettings } from './useBankSettings'
import { useOrderCancellation } from './useOrderCancellation'
import { useWaitingTime } from './useWaitingTime'
import { useClipboard } from './useClipboard'
import {
  LoadingState,
  ErrorState,
  WaitingStatusCard,
  BankDetailsCard,
  InstructionsCard,
  OrderInfoCard,
  CancelConfirmationModal,
  ErrorMessage
} from './components'

export const PaymentPendingPage: React.FC = () => {
  const { customerId, orderId } = useParams<{ customerId: string; orderId: string }>()
  const { order, loading, error } = usePaymentPolling(orderId, customerId)
  const { bankSettings } = useBankSettings()
  const { waitingMinutes } = useWaitingTime(order?.createdAt)
  const { copiedField, copyToClipboard } = useClipboard()
  const {
    isCancelling,
    showCancelModal,
    cancelError,
    handleCancelOrderClick,
    handleConfirmCancel,
    handleCloseCancelModal
  } = useOrderCancellation(order, customerId)

  if (loading) {
    return <LoadingState />
  }

  if (error || !order || !bankSettings) {
    return <ErrorState error={error || 'Order not found'} customerId={customerId || ''} />
  }

  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold drop-shadow-md text-center">🏦 Payment Pending</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
        <div className="p-4 pb-32 space-y-4">
          {/* Waiting Status */}
          <WaitingStatusCard waitingMinutes={waitingMinutes} />

          {/* Bank Transfer Details */}
          <BankDetailsCard
            bankName={bankSettings.bankName}
            accountNumber={bankSettings.bankAccountNumber}
            accountHolder={bankSettings.bankAccountHolder}
            amount={order.total}
            transferReference={order.transferReference || ''}
            copiedField={copiedField}
            onCopy={copyToClipboard}
          />

          {/* Instructions */}
          <InstructionsCard
            transferReference={order.transferReference || ''}
            amount={order.total}
            customInstructions={bankSettings.bankTransferInstructions}
          />

          {/* Order Info */}
          <OrderInfoCard order={order} />

          {/* Cancel Error Message */}
          <ErrorMessage message={cancelError} />
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-400 p-3 shadow-2xl">
        <div className="space-y-2">
          <div className="text-center text-xs text-gray-600 mb-2">💡 Tip: Screenshot these details for your records</div>

          <button
            onClick={handleCancelOrderClick}
            disabled={isCancelling}
            className={`w-full font-semibold text-sm py-3 px-4 rounded-lg transition-all border-2 ${
              isCancelling
                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-white text-red-600 border-red-500 hover:bg-red-50'
            }`}
          >
            {isCancelling ? '⏳ Cancelling...' : '❌ Cancel Order'}
          </button>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showCancelModal}
        isCancelling={isCancelling}
        cancelError={cancelError}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}
