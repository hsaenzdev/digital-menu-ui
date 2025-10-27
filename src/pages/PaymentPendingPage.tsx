import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import type { Order, ApiResponse } from "../types";

interface BankSettings {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankTransferInstructions: string;
}

export const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId, orderId } = useParams<{
    customerId: string;
    orderId: string;
  }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [waitingMinutes, setWaitingMinutes] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch order and bank settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderResponse, settingsResponse] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch("/api/settings/public/bank-transfer"),
        ]);

        if (orderResponse.ok) {
          const orderData: ApiResponse<Order> = await orderResponse.json();
          if (orderData.success && orderData.data) {
            setOrder(orderData.data);

            // If payment already confirmed, redirect to order status
            if (orderData.data.paymentStatus === "confirmed") {
              navigate(`/${customerId}/order-status/${orderId}`);
              return;
            }

            // If order cancelled, redirect to menu
            if (orderData.data.status === "cancelled") {
              navigate(`/${customerId}/menu`);
              return;
            }
          } else {
            setError(orderData.error || "Order not found");
          }
        } else {
          setError("Failed to load order");
        }

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setBankSettings({
            bankName: settingsData.bankName || "",
            bankAccountNumber: settingsData.bankAccountNumber || "",
            bankAccountHolder: settingsData.bankAccountHolder || "",
            bankTransferInstructions:
              settingsData.bankTransferInstructions || "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, customerId, navigate]);

  // Poll for payment status updates every 10 seconds
  useEffect(() => {
    if (!orderId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data: ApiResponse<Order> = await response.json();
          if (data.success && data.data) {
            // Payment confirmed - redirect to order status
            if (data.data.paymentStatus === "confirmed") {
              navigate(`/${customerId}/order-status/${orderId}`);
              return;
            }

            // Order cancelled - redirect to menu
            if (data.data.status === "cancelled") {
              navigate(`/${customerId}/menu`);
              return;
            }

            setOrder(data.data);
          }
        }
      } catch {
        // Silently fail - will retry on next poll
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [orderId, customerId, navigate]);

  // Update waiting time
  useEffect(() => {
    if (!order?.createdAt) return;

    const updateWaitingTime = () => {
      const created = new Date(order.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const minutes = Math.floor(diffMs / 60000);
      setWaitingMinutes(minutes);
    };

    updateWaitingTime();
    const interval = setInterval(updateWaitingTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order?.createdAt]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Silently fail
    }
  };

  const handleCancelOrderClick = () => {
    if (!order) return;

    // Validate if payment was already confirmed
    if (order.paymentStatus === "confirmed") {
      setCancelError(
        "Payment has already been confirmed. You cannot cancel this order anymore."
      );
      return;
    }

    // Validate if order was already accepted by staff (status moved from pending_payment)
    if (order.status !== "pending_payment") {
      setCancelError(
        "This order has already been accepted by the restaurant. You cannot cancel it anymore."
      );
      return;
    }

    // Show confirmation modal
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successfully cancelled - redirect to welcome page
        setShowCancelModal(false);
        navigate(`/${customerId}`);
      } else {
        // Handle specific error cases
        if (data.error?.includes("status")) {
          setCancelError("This order cannot be cancelled at this stage.");
        } else {
          setCancelError(
            data.error || "Failed to cancel order. Please try again."
          );
        }
      }
    } catch {
      setCancelError("Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🏦</div>
            <p className="text-white text-2xl font-bold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order || !bankSettings) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-red-500 via-red-600 to-rose-600 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-8xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Something Went Wrong
            </h2>
            <p className="text-white/90 text-lg mb-6">
              {error || "Order not found"}
            </p>
            <button
              onClick={() => navigate(`/${customerId}/menu`)}
              className="bg-white text-red-600 font-bold text-lg py-4 px-8 rounded-xl hover:bg-red-50 transition-all"
            >
              Return to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold drop-shadow-md text-center">
          🏦 Payment Pending
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
        <div className="p-4 pb-32 space-y-4">
          {/* Waiting Status */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 border-2 border-blue-300 shadow-md text-center">
            <div className="text-5xl mb-3">⏳</div>
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              Please Wait
            </h2>
            <p className="text-blue-800 font-medium mb-1">
              Your order is reserved while we confirm your payment
            </p>
            <p className="text-blue-600 text-sm">
              Waiting for {waitingMinutes}{" "}
              {waitingMinutes === 1 ? "minute" : "minutes"}...
            </p>
          </div>

          {/* Bank Transfer Details */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
              <span>💰</span>
              <span>Complete Your Transfer</span>
            </h3>

            <div className="space-y-3">
              {/* Bank Name */}
              <div className="bg-blue-50 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Bank Name
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-gray-900">
                    {bankSettings.bankName}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(bankSettings.bankName, "bankName")
                    }
                    className="text-blue-600 hover:text-blue-700 p-2"
                    title="Copy"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                {copiedField === "bankName" && (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Copied!
                  </span>
                )}
              </div>

              {/* Account Number */}
              <div className="bg-blue-50 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Account Number
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-gray-900 text-lg">
                    {bankSettings.bankAccountNumber}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        bankSettings.bankAccountNumber,
                        "accountNumber"
                      )
                    }
                    className="text-blue-600 hover:text-blue-700 p-2"
                    title="Copy"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                {copiedField === "accountNumber" && (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Copied!
                  </span>
                )}
              </div>

              {/* Account Holder */}
              <div className="bg-blue-50 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Account Holder
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-gray-900">
                    {bankSettings.bankAccountHolder}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        bankSettings.bankAccountHolder,
                        "accountHolder"
                      )
                    }
                    className="text-blue-600 hover:text-blue-700 p-2"
                    title="Copy"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                {copiedField === "accountHolder" && (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Copied!
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-300">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Amount to Transfer
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-green-600 text-2xl">
                    ${order.total.toFixed(2)}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(order.total.toFixed(2), "amount")
                    }
                    className="text-green-600 hover:text-green-700 p-2"
                    title="Copy"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                {copiedField === "amount" && (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Copied!
                  </span>
                )}
              </div>

              {/* Reference */}
              <div className="bg-amber-50 rounded-lg p-3 border-2 border-amber-300">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  ⚡ IMPORTANT: Transfer Reference
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-900 text-xl font-mono">
                    {order.transferReference}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        order.transferReference || "",
                        "reference"
                      )
                    }
                    className="text-amber-600 hover:text-amber-700 p-2"
                    title="Copy"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
                {copiedField === "reference" && (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Copied!
                  </span>
                )}
                <p className="text-xs text-amber-800 font-semibold mt-2 bg-amber-100 p-2 rounded">
                  📝 You MUST use this reference number in your bank transfer so
                  we can identify your payment!
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300 shadow-md">
            <h3 className="font-bold text-orange-900 mb-3 text-base flex items-center gap-2">
              <span>📋</span>
              <span>How to Complete Payment</span>
            </h3>
            <div className="space-y-2.5 text-sm text-gray-800">
              <div className="flex gap-2">
                <span className="font-bold text-orange-600">1.</span>
                <p>
                  <span className="font-semibold">Open your banking app</span>{" "}
                  or visit your bank
                </p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-600">2.</span>
                <p>
                  <span className="font-semibold">Make a transfer</span> to the
                  account details above
                </p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-600">3.</span>
                <p>
                  <span className="font-semibold">
                    Use the reference number
                  </span>{" "}
                  <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">
                    {order.transferReference}
                  </span>{" "}
                  in your transfer
                </p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-600">4.</span>
                <p>
                  <span className="font-semibold">Transfer exactly</span> $
                  {order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-orange-600">5.</span>
                <p>
                  <span className="font-semibold">Wait here</span> - We'll
                  confirm within 15 minutes during business hours
                </p>
              </div>
            </div>

            {bankSettings.bankTransferInstructions && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-xs text-gray-700">
                  {bankSettings.bankTransferInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">
              📋 Order Details
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-bold text-gray-900">
                  #{order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-green-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-bold text-orange-600">
                  Awaiting Payment
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {cancelError && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⛔</span>
                <div>
                  <p className="text-red-900 font-bold text-sm mb-1">
                    Cannot Cancel Order
                  </p>
                  <p className="text-red-800 text-sm">{cancelError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-400 p-3 shadow-2xl">
        <div className="space-y-2">
          <div className="text-center text-xs text-gray-600 mb-2">
            💡 Tip: Screenshot these details for your records
          </div>

          <button
            onClick={handleCancelOrderClick}
            disabled={isCancelling}
            className={`w-full font-semibold text-sm py-3 px-4 rounded-lg transition-all border-2 ${
              isCancelling
                ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-white text-red-600 border-red-500 hover:bg-red-50"
            }`}
          >
            {isCancelling ? "⏳ Cancelling..." : "❌ Cancel Order"}
          </button>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !isCancelling && setShowCancelModal(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Icon */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Cancel Order?
                </h2>
              </div>

              {/* Message */}
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 text-center">
                  Are you sure you want to cancel this order?
                </p>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                  <p className="text-sm text-amber-900 font-semibold mb-2">
                    ⚠️ Important Notice:
                  </p>
                  <p className="text-sm text-amber-800">
                    If you have already made the bank transfer, we will refund
                    your money. However, the refund process might take time
                    depending on your bank's processing schedule.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 <span className="font-semibold">Tip:</span> If you
                    haven't transferred yet, you can simply cancel. If you have
                    transferred, please keep your receipt for the refund
                    process.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {cancelError && (
                <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800">{cancelError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
