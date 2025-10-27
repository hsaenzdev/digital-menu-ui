import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import type { Order, PaymentMethod, ApiResponse } from "../types";

interface BankSettings {
  bankTransferEnabled: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankTransferInstructions: string;
}

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const { cart, clearCart } = useCart();
  const { customer, location, customerLocationId } = useCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);

  const hasCartItems =
    cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0;
  const hasCustomerInfo = customer?.id && customer?.name;

  // Fetch bank settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/public/bank-transfer");
        if (response.ok) {
          const data = await response.json();
          setBankSettings({
            bankTransferEnabled: data.bankTransferEnabled ?? false,
            bankName: data.bankName || "",
            bankAccountNumber: data.bankAccountNumber || "",
            bankAccountHolder: data.bankAccountHolder || "",
            bankTransferInstructions: data.bankTransferInstructions || "",
          });
        }
      } catch {
        // Use defaults if fetch fails
        setBankSettings({
          bankTransferEnabled: false,
          bankName: "",
          bankAccountNumber: "",
          bankAccountHolder: "",
          bankTransferInstructions: "",
        });
      }
    };
    fetchSettings();
  }, []);

  const calculateTotal = () => {
    if (!hasCartItems) return 0;
    return cart.subtotal + cart.tax + cart.tip;
  };

  const handleSubmitOrder = async () => {
    if (!hasCartItems || !hasCustomerInfo || !location || !customerId) {
      setError("Missing required information");
      return;
    }

    if (!customerLocationId) {
      setError("Location not resolved. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        customerId,
        customerLocationId,
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        tip: cart.tip,
        total: calculateTotal(),
        paymentMethod,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result: ApiResponse<Order> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit order");
      }

      setSubmittedOrder(result.data!);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order submitted and it's bank transfer with pending payment, redirect to payment pending page
  if (
    submittedOrder &&
    submittedOrder.paymentMethod === "bank_transfer" &&
    submittedOrder.status === "pending_payment"
  ) {
    navigate(`/${customerId}/payment-pending/${submittedOrder.id}`);
    return null;
  }

  if (submittedOrder) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 overflow-hidden">
        {/* Header - Consistent */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/${customerId}`)}
              className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
              title="Settings"
            >
              <FontAwesomeIcon icon={faCog} className="text-base" />
            </button>
            <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">
              ✅ Order Submitted
            </h1>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-green-50 to-white">
          <div className="p-3 pb-32">
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-green-600 mb-1.5">
                Order Confirmed!
              </h2>
              <p className="text-lg text-green-600 font-bold">
                Order #{submittedOrder?.id}
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-3 mt-4 text-left shadow-md">
                <h3 className="font-bold text-green-900 mb-2 text-sm">
                  Order Summary
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">
                      Customer:
                    </span>
                    <span className="font-bold text-green-900">
                      {customer?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Total:</span>
                    <span className="font-bold text-green-600 text-base">
                      ${submittedOrder?.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 font-medium mt-4 mb-2 text-sm">
                🎊 Your order is on its way!
              </p>
              <p className="text-gray-600 text-xs">
                We'll prepare your delicious food and deliver it hot to your
                door.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Action Button - Compact */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-400 p-2.5 shadow-2xl z-50">
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            onClick={() =>
              navigate(`/${customerId}/order-status/${submittedOrder.id}`)
            }
          >
            📋 View Order Details
          </button>
        </div>
      </div>
    );
  }

  if (!hasCartItems) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Header - Consistent */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/${customerId}`)}
              className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
              title="Settings"
            >
              <FontAwesomeIcon icon={faCog} className="text-base" />
            </button>
            <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">
              📋 Order Confirmation
            </h1>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-8 px-3">
            <div className="text-5xl mb-3">🛒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Items in Cart
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Your cart is empty. Please add some items before proceeding.
            </p>
            <button
              className="bg-gradient-to-r from-fire-600 to-ember-600 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:from-fire-700 hover:to-ember-700 transition-all shadow-lg"
              onClick={() => navigate(`/${customerId}/menu`)}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasCustomerInfo) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Header - Consistent */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/${customerId}`)}
              className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
              title="Settings"
            >
              <FontAwesomeIcon icon={faCog} className="text-base" />
            </button>
            <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">
              📋 Order Confirmation
            </h1>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-8 px-3">
            <div className="text-5xl mb-3">👤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Customer Information Required
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Please provide your information to proceed with the order.
            </p>
            <button
              className="bg-gradient-to-r from-fire-600 to-ember-600 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:from-fire-700 hover:to-ember-700 transition-all shadow-lg"
              onClick={() => navigate(`/${customerId}/setup`)}
            >
              Enter Customer Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header - Consistent */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/${customerId}`)}
            className="flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 border border-white/20"
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} className="text-base" />
          </button>
          <h1 className="text-lg font-bold drop-shadow-md text-center flex-1">
            📋 Order Confirmation
          </h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-3 pb-32 space-y-3">
          {/* Customer Information - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">
              Customer Information
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="font-bold text-gray-900">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Location:</span>
                <span className="font-bold text-gray-900 truncate ml-2">
                  {location?.address || "Location not available"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">
              Order Items ({cart.items.length})
            </h3>

            <div className="space-y-2">
              {cart.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-2.5 bg-gradient-to-r from-fire-50 to-ember-50 rounded-lg border border-fire-200"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-gray-600 font-medium">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      ${item.itemPrice.toFixed(2)} each
                    </p>

                    {/* Modifiers */}
                    {item.selectedModifiers &&
                      item.selectedModifiers.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {item.selectedModifiers.map((modifier, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              <span className="font-bold">
                                {modifier.modifierName}:
                              </span>
                              {modifier.selectedOptions.map(
                                (option, optIdx) => (
                                  <span key={optIdx} className="ml-1">
                                    {option.optionName} (+$
                                    {option.price.toFixed(2)})
                                  </span>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Special Notes */}
                    {item.specialNotes && (
                      <div className="mt-1.5 text-xs text-fire-800 bg-amber-50 p-1.5 rounded border-l-2 border-fire-400">
                        <span className="font-bold">Note:</span>{" "}
                        {item.specialNotes}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-3">
                    <div className="font-bold text-fire-600 text-sm">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Compact */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">
              Order Summary
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Subtotal:</span>
                <span className="text-gray-900 font-bold">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Tax:</span>
                <span className="text-gray-900 font-bold">
                  ${cart.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Tip:</span>
                <span className="text-gray-900 font-bold">
                  ${cart.tip.toFixed(2)}
                </span>
              </div>
              <hr className="my-1.5 border-fire-200" />
              <div className="flex justify-between text-base font-bold pt-1">
                <span className="text-gray-900">Total:</span>
                <span className="text-fire-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-fire-200">
            <h3 className="font-bold text-gray-900 mb-2.5 text-sm">
              💳 Payment Method
            </h3>

            <div className="space-y-2">
              {/* Cash Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === "cash"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-white hover:border-green-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💵</span>
                      <span className="font-bold text-gray-900 text-sm">
                        Cash on Delivery
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-7">
                      Pay when your order arrives
                    </p>
                  </div>
                  {paymentMethod === "cash" && (
                    <div className="ml-2">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Bank Transfer Payment */}
              {bankSettings?.bankTransferEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏦</span>
                        <span className="font-bold text-gray-900 text-sm">
                          Bank Transfer
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-7">
                        Transfer now, we'll confirm
                      </p>
                    </div>
                    {paymentMethod === "bank_transfer" && (
                      <div className="ml-2">
                        <span className="text-blue-600 text-lg">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 shadow-md">
              <div className="text-red-800">
                <div className="font-bold mb-0.5 text-sm">
                  Order Submission Failed
                </div>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons - Compact */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-fire-400 p-2.5 shadow-2xl z-50">
        <div className="space-y-1.5">
          <button
            className="w-full bg-white text-fire-600 border border-fire-500 font-semibold text-xs py-2 px-4 rounded-lg hover:bg-fire-50 transition-all"
            onClick={() => navigate(`/${customerId}/cart`)}
          >
            🛒 Go to Cart
          </button>

          <button
            className={`w-full font-semibold text-sm py-2.5 px-4 rounded-lg transition-all shadow-lg ${
              isSubmitting
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            }`}
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Submitting..." : "✅ Submit Order"}
          </button>
        </div>
      </div>
    </div>
  );
};
