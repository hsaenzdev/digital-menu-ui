import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomer } from "../../context/CustomerContext";
import { useValidationRedirect } from "../../components/validation-errors/useValidationRedirect";
import { useActiveOrderDetection } from "./useActiveOrderDetection";
import { useLocationResolution } from "./useLocationResolution";
import { WelcomeForm } from "./WelcomeForm";
import { LoadingState, ErrorState } from "./components";
import type { Customer, ApiResponse } from "../../types";

/**
 * Clean WelcomePage - Entry point for customers
 *
 * Responsibilities:
 * 1. Fetch customer data
 * 2. Run all validations via useValidationRedirect hook
 * 3. Detect active orders (for UI and restaurant-closed validation)
 * 4. Resolve GPS location to address
 * 5. Collect name & address via form
 * 6. Navigate to menu on submit
 *
 * What this page does NOT do:
 * - Manual validation logic (handled by useValidationRedirect)
 * - Render error states (handled by error pages via auto-redirect)
 * - Complex state management (separated into custom hooks)
 */
export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const {
    customer,
    setCustomer,
    setLocation: setContextLocation,
    setCustomerLocationId,
  } = useCustomer();

  // Initial customer fetch state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const { isValidating, data } = useValidationRedirect({
    customerId: customerId!,
    validations: [
      { name: "geoLocationSupport" },
      { name: "geoLocationGather" },
      { name: "geofencingValidate" },
      { name: "customerExists" },
      { name: "customerStatus" },
      { name: "restaurantStatus" },
    ],
  });

  // Fetch customer data on mount
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        setError("No customer ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/customers/${customerId}`);
        const data: ApiResponse<Customer> = await response.json();

        if (data.success && data.data) {
          setCustomer(data.data);
          // Pre-fill name if customer already has one
          if (data.data.name) {
            setName(data.data.name);
          }
        }
      } catch {
        setError("Failed to load customer information");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, setCustomer]);

  // Detect active orders (needed for restaurant-closed validation and UI)
  const { activeOrder } = useActiveOrderDetection(customer?.id);

  // Location resolution hook (GPS → address, save to DB)
  const {
    locationData,
    resolvedLocationId,
    isResolving,
    error: locationError,
    updateAddress,
    saveAddress,
    resolveLocation
  } = useLocationResolution(customerId);

  // Auto-resolve address when GPS data is available
  useEffect(() => {
    if (data.geoLocationGather && !resolvedLocationId) {
      const { latitude, longitude } = data.geoLocationGather;
      resolveLocation(latitude, longitude).then((result) => {
        if (result?.address) {
          setAddress(result.address);
        }
      });
    }
  }, [data.geoLocationGather, resolvedLocationId, resolveLocation]);

  // Pre-fill customer name when available
  useEffect(() => {
    if (data.customerExists?.customer?.name && !name) {
      setName(data.customerExists.customer.name);
    }
  }, [data.customerExists, name]);

  // Handle address changes
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    updateAddress(newAddress);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError("Please enter your name");
      return;
    }

    if (!address.trim()) {
      setFormError("Please provide your delivery address");
      return;
    }

    if (!customer?.id) {
      setFormError(
        "No customer ID available. Please start from the link provided."
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      // Update customer name
      const nameResponse = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!nameResponse.ok) {
        throw new Error("Failed to update customer");
      }

      // Save address to location if we have a resolved location ID
      if (resolvedLocationId && address.trim()) {
        await saveAddress(address.trim());
      }

      // Prepare final location data
      const finalLocation =
        locationData && locationData.latitude !== 0
          ? { ...locationData, address: address.trim() }
          : {
              latitude: 0,
              longitude: 0,
              address: address.trim(),
            };

      // Save to context
      setCustomer({ ...customer, name: name.trim() });
      setContextLocation(finalLocation);

      if (resolvedLocationId) {
        setCustomerLocationId(resolvedLocationId);
      }

      // Navigate to menu
      navigate(`/${customerId}/menu`);
    } catch {
      setFormError("Failed to save information. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state during initial customer fetch
  if (loading) {
    return <LoadingState message="Loading..." />;
  }

  // Show error state if initial customer fetch failed
  if (error) {
    return <ErrorState message={error} />;
  }

  // Show loading state during validations
  if (isValidating) {
    return <LoadingState message="Validating access..." />;
  }

  // All validations passed! Show form
  return (
    <WelcomeForm
      customerId={customerId!}
      name={name}
      address={address}
      locationLoading={isResolving}
      locationError={locationError}
      formError={formError}
      saving={saving}
      hasGPS={locationData !== null && locationData.latitude !== 0}
      activeOrder={activeOrder}
      onNameChange={setName}
      onAddressChange={handleAddressChange}
      onSubmit={handleSubmit}
    />
  );
};
