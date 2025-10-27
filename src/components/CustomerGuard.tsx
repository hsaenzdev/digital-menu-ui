import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import type { Customer, ApiResponse } from "../types";

interface CustomerGuardProps {
  children: React.ReactNode;
}

export const CustomerGuard: React.FC<CustomerGuardProps> = ({ children }) => {
  const { customerId } = useParams<{ customerId: string }>();
  const { customer, setCustomer } = useCustomer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const validateCustomer = async () => {
      if (!customerId) {
        setError("No customer ID provided in URL");
        setLoading(false);
        return;
      }

      if (customer?.id === customerId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/customers/${customerId}`);
        const data: ApiResponse<Customer> = await response.json();

        if (!data.success || !data.data) {
          setError("Customer not found");
          setLoading(false);
          return;
        }

        setCustomer(data.data);
        setLoading(false);
      } catch {
        setError("Failed to validate customer");
        setLoading(false);
      }
    };

    validateCustomer();
  }, [customerId, customer?.id, setCustomer]);

  if (loading) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🔐</div>
            <p className="text-white text-2xl font-bold">
              Validating access...
            </p>
            <p className="text-white/80 text-sm mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customerId) {
    return (
      <div className="h-screen-dvh flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6">🚫</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4">
              Access Denied
            </h2>
            <p className="text-white/90 text-lg mb-6 drop-shadow">
              {error ||
                "Invalid access link. Please use the link provided to you."}
            </p>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
              <p className="text-white/80 text-sm mb-2">
                <span className="font-semibold">Need help?</span>
              </p>
              <p className="text-white/70 text-xs">
                Make sure you're using the correct link sent to you via WhatsApp
                or Messenger.
              </p>
            </div>

            <div className="text-white/80 text-sm">
              <p className="mb-2">📞 Contact us for a new link:</p>
              <p className="text-white/60 text-xs">(555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
