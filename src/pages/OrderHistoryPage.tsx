import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useCustomer } from "../context/CustomerContext";
import type { Order, ApiResponse } from "../types";

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer?.id) {
        setError("No customer information available");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/customers/${customer.id}/orders`);
        const data: ApiResponse<Order[]> = await response.json();

        if (data.success && data.data) {
          setOrders(data.data);
        } else {
          setError(data.error || "Failed to load orders");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✅";
      case "preparing":
        return "👨‍🍳";
      case "ready":
        return "🔔";
      case "delivered":
        return "🎉";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "preparing":
        return "text-orange-600 bg-orange-50";
      case "ready":
        return "text-green-600 bg-green-50";
      case "delivered":
        return "text-purple-600 bg-purple-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        {/* Header - Consistent */}
        <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
          <h1 className="text-lg font-bold text-center drop-shadow-md">
            📋 Order History
          </h1>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-8">
            <div className="text-5xl mb-3 animate-pulse">⏳</div>
            <p className="text-gray-600 font-medium text-sm">
              Loading your order history...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
              📋 Order History
            </h1>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
          <div className="text-center py-8 px-3">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Failed to Load Orders
            </h3>
            <p className="text-gray-600 mb-4 text-sm font-medium">{error}</p>
            <button
              className="bg-gradient-to-r from-fire-600 to-ember-600 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:from-fire-700 hover:to-ember-700 transition-all shadow-lg"
              onClick={() => navigate(`/${customerId}`)}
            >
              🏠 Back to Home
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
            📋 Order History
          </h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
        <div className="p-3 pb-20 space-y-3">
          {/* Empty State - Compact */}
          {!loading && orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-6 font-medium text-sm">
                Your order history will appear here once you place your first
                order!
              </p>
              <button
                className="bg-gradient-to-r from-fire-600 to-ember-600 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:from-fire-700 hover:to-ember-700 transition-all shadow-lg"
                onClick={() => navigate(`/${customerId}`)}
              >
                🏠 Back to Home
              </button>
            </div>
          )}

          {/* Orders List - Compact */}
          {!loading && orders.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-gray-900">
                Your Orders ({orders.length})
              </h2>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md p-3 border border-fire-200 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900 text-sm">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-0.5 font-medium">
                      <div>
                        📅 {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                      <div className="truncate">
                        📍{" "}
                        {order.customerLocation?.address ||
                          "Address not available"}
                      </div>
                      <div className="font-bold text-fire-600">
                        💰 ${order.total.toFixed(2)} • {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview - Compact */}
                  <div className="bg-gradient-to-r from-fire-50 to-ember-50 rounded-lg p-2.5 border border-fire-200">
                    <h4 className="font-bold text-gray-900 mb-1.5 text-xs">
                      Items:
                    </h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-gray-700 font-medium">
                            {item.quantity}x {item.itemName}
                          </span>
                          <span className="text-gray-900 font-bold">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500 italic font-medium">
                          +{order.items.length - 3} more item
                          {order.items.length - 3 !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions - Compact */}
                  <div className="mt-2.5">
                    <button
                      className="w-full bg-gradient-to-r from-fire-600 to-ember-600 hover:from-fire-700 hover:to-ember-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md"
                      onClick={() =>
                        navigate(`/${customerId}/order-status/${order.id}`)
                      }
                    >
                      📋 View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
