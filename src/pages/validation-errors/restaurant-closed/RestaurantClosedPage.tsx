import React from "react";
import { useErrorPageHelpers } from "../../../components/validation-errors/useValidationRedirect";
import { useRestaurantStatus } from "./useRestaurantStatus";
import { useActiveOrders } from "../../../hooks/useActiveOrders";
import {
  getStatusEmoji,
  formatTimeUntilOpening,
  getStatusTitle,
} from "./restaurantStatusUtils";
import { SUPPORT_PHONE } from "../constants";

/**
 * Error page shown when restaurant is closed
 *
 * Triggered by: validateRestaurantStatus failed (isOpen = false)
 * State: 'restaurant_closed' or 'restaurant_closed_active_orders'
 *
 * Handles both cases:
 * - Customer with no active orders: Shows next opening time
 * - Customer with active orders: Shows order tracking option
 *
 * Matches WelcomePage styling for consistency
 */
export const RestaurantClosedPage: React.FC = () => {
  const { handleViewHistory, handleTrackOrder, handleRetry } =
    useErrorPageHelpers();

  const restaurantStatus = useRestaurantStatus();
  const { hasActiveOrders, activeOrders } = useActiveOrders();

  // Get first active order to display
  const primaryOrder = activeOrders[0];

  // Use API data with fallbacks
  const currentStatus = restaurantStatus?.currentStatus || "closed";
  const emoji = getStatusEmoji(currentStatus);
  const title = getStatusTitle(currentStatus);
  const message =
    restaurantStatus?.message || "We're not accepting orders right now.";
  const nextOpening = restaurantStatus?.nextOpening || null;
  const timeUntilOpening = formatTimeUntilOpening(nextOpening);

  return (
    <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 overflow-hidden p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-6">{emoji}</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
            {title}
          </h2>

          {/* Active Order Notice - Shown if customer has pending orders */}
          {hasActiveOrders && primaryOrder ? (
            <div className="bg-green-500/20 backdrop-blur border-2 border-green-300/50 rounded-xl p-4 mb-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-white font-bold text-base mb-1">Don't Worry!</p>
              <p className="text-white/90 text-sm mb-3">
                We're closed for new orders, but we're still preparing and will
                deliver your active order #
                {primaryOrder.orderNumber ||
                  primaryOrder.id?.slice(-6) ||
                  "N/A"}
                !
              </p>
            </div>
          ) : (
            <p className="text-white/90 text-lg mb-6 drop-shadow">
              {message}
            </p>
          )}

          {/* Next Opening Card */}
          {nextOpening && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-6">
              <p className="text-white/80 text-xs font-semibold mb-1">
                Next Opening:
              </p>
              <p className="text-white text-lg font-bold mb-0.5">
                {nextOpening.day} at {nextOpening.time}
              </p>
              {timeUntilOpening && (
                <p className="text-white/70 text-xs">{timeUntilOpening}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Track Order Button - Primary (only shown if active order exists) */}
            {hasActiveOrders && primaryOrder && (
              <button
                className="w-full bg-green-500 text-white font-bold text-base py-3.5 px-6 rounded-xl shadow-lg hover:bg-green-600 transform active:scale-95 transition-all"
                onClick={() => handleTrackOrder(primaryOrder.id)}
              >
                📦 Track My Order #
                {primaryOrder.orderNumber || primaryOrder.id?.slice(-6) || ""}
              </button>
            )}

            {/* Order History Button - Hidden when there's an active order */}
            {!hasActiveOrders && (
              <button
                className="w-full bg-white/20 backdrop-blur text-white font-bold text-base py-3.5 px-6 rounded-xl shadow-lg hover:bg-white/30 border-2 border-white/40 transform active:scale-95 transition-all"
                onClick={handleViewHistory}
              >
                📜 View Order History
              </button>
            )}

            {/* Check Again Button */}
            <button
              className="w-full bg-white text-indigo-600 font-bold text-base py-3.5 px-6 rounded-xl shadow-lg hover:bg-indigo-50 transform active:scale-95 transition-all"
              onClick={handleRetry}
            >
              🔄 Check Again
            </button>

            <div className="text-white/80 text-xs mt-3">
              <p className="mb-1">📞 Questions?</p>
              <p className="text-white/60 text-xs">Call us: {SUPPORT_PHONE}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
