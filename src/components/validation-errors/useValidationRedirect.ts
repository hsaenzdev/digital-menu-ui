/**
 * useValidationRedirect Hook (v2)
 *
 * Thin wrapper around useValidations that auto-redirects on validation failure.
 * Handles navigation to appropriate error pages based on validation state.
 */

import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useValidations } from "../../hooks/useValidations";
import type {
  UseValidationsConfig,
  UseValidationsReturnV2,
  ValidationState,
} from "../../hooks/useValidations/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuration for useValidationRedirect hook
 */
export interface UseValidationRedirectConfig
  extends Omit<UseValidationsConfig, "autoRun"> {
  /** Customer ID for validation and routing */
  customerId: string;

  /** Auto-run validation on mount (default: true) */
  autoRun?: boolean;

  /** Custom redirect handler (override default behavior) */
  onRedirect?: (route: string, state: any) => void;

  /** Additional state to pass to error page */
  customState?: Record<string, any>;
}

/**
 * Return type (same as useValidations)
 */
export type UseValidationRedirectReturn = UseValidationsReturnV2;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Maps validation state to error route path
 *
 * @param validationState - The validation state from hook
 * @param customerId - Customer ID for building route
 * @returns Error route path or null if no error
 */
function getErrorRoute(
  validationState: ValidationState | undefined,
  customerId: string
): string | null {
  // No redirect needed for success or loading states
  if (
    !validationState ||
    validationState === "allowed" ||
    validationState === "idle" ||
    validationState === "loading"
  ) {
    return null;
  }

  // Map validation states to routes
  const routes: Record<ValidationState, string> = {
    idle: "",
    loading: "",
    allowed: "",
    customer_not_found: "/error/customer-not-found",
    customer_disabled: `/${customerId}/error/customer-disabled`,
    restaurant_closed: `/${customerId}/error/restaurant-closed`,
    restaurant_closed_active_orders: `/${customerId}/error/restaurant-closed`,
    no_geolocation_support: `/${customerId}/error/no-geolocation-support`,
    no_location_permission: `/${customerId}/error/no-location-permission`,
    outside_city: `/${customerId}/error/outside-city`,
    outside_zone: `/${customerId}/error/outside-zone`,
    error: `/${customerId}/error/generic`,
  };

  return routes[validationState] || `/${customerId}/error/generic`;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * useValidationRedirect Hook
 *
 * Performs validations and automatically redirects to error pages on failure.
 * This is a thin wrapper around useValidations that adds redirect orchestration.
 *
 * @param config - Validation and redirect configuration
 * @returns Validation state and control functions
 *
 * @example
 * // Standard usage - auto-redirects on failure
 * const { state, isValidating } = useValidationRedirect({
 *   customerId: customerId!,
 *   validations: [
 *     { name: 'customerExists' },
 *     { name: 'restaurantStatus' }
 *   ]
 * })
 *
 * if (isValidating) return <LoadingSpinner />
 * if (state.phase === 'success') return <PageContent />
 * return null // Redirect will happen automatically
 */
export function useValidationRedirect(
  config: UseValidationRedirectConfig
): UseValidationRedirectReturn {
  const navigate = useNavigate();

  // Run core validation logic
  const validation = useValidations(config.customerId, {
    validations: config.validations,
    autoRun: config.autoRun ?? true, // Default to true for redirect hook
    skipCache: config.skipCache,
    apiTimeout: config.apiTimeout,
  });

  // Watch for validation failures and auto-redirect
  useEffect(() => {
    // Only act when validation has failed
    if (validation.state.phase !== "failed") {
      return;
    }

    // Get the appropriate error route
    const errorRoute = getErrorRoute(
      validation.state.validationState,
      config.customerId
    );

    // No route means no redirect needed
    if (!errorRoute) {
      return;
    }

    // Prepare state to pass to error page
    const navigationState = {
      // Validation metadata
      validationState: validation.state.validationState,
      error: validation.state.error,
      failedStep: validation.state.failedStep,
      completedSteps: validation.state.completedSteps,

      // All accumulated validation data
      ...validation.data,

      // Custom state from caller
      ...config.customState,
    };

    // Perform redirect
    if (config.onRedirect) {
      // Custom redirect handler
      config.onRedirect(errorRoute, navigationState);
    } else {
      // Default navigation
      navigate(errorRoute, {
        state: navigationState,
        replace: false, // Keep in history for back button
      });
    }
  }, [
    validation.state.phase,
    validation.state.validationState,
    config.customerId,
    config.onRedirect,
    navigate,
  ]);

  // Return validation result as-is
  return validation;
}

// ============================================================================
// ERROR PAGE HELPER
// ============================================================================

/**
 * Helper hook for error pages to access validation state and navigation helpers
 *
 * @example
 * const { state, handleRetry } = useErrorPageHelpers()
 *
 * return (
 *   <div>
 *     <h1>{state?.error}</h1>
 *     <button onClick={handleRetry}>Try Again</button>
 *   </div>
 * )
 */
export function useErrorPageHelpers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams<{ customerId: string }>();

  // Extract state passed from useValidationRedirect
  const validationData = location.state as any;

  /**
   * Retry validation by navigating back to customer home
   */
  const handleRetry = () => {
    if (customerId) {
      navigate(`/${customerId}`);
    } else {
      // Fallback for pages without customerId in URL
      navigate("/");
    }
  };

  /**
   * Navigate to order tracking (for active orders)
   */
  const handleTrackOrder = (orderId: string) => {
    if (customerId) {
      navigate(`/${customerId}/order-status/${orderId}`);
    }
  };

  /**
   * Navigate to order history
   */
  const handleViewHistory = () => {
    if (customerId) {
      navigate(`/${customerId}/orders`);
    }
  };

  return {
    customerId,
    state: validationData,
    handleRetry,
    handleTrackOrder,
    handleViewHistory,
  };
}
