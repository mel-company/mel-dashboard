import { Navigate, useLocation } from "react-router-dom";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import {
  isFrozenAllowedPath,
  isFrozenPhase,
} from "@/utils/subscription-lifecycle";
import SubscriptionFrozenScreen from "./SubscriptionFrozenScreen";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";

/**
 * After OTP a FROZEN store can authenticate, but most APIs 402. Keep the
 * merchant on renew / payment / support instead of a blank home that fails.
 */
export function SubscriptionLifecycleGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { data, isLoading, isFetching } = usePlanUsage();
  const phase = data?.subscription?.lifecyclePhase;

  if ((isLoading || isFetching) && !data) {
    return <AuthLoadingScreen message="جاري التحقق من الاشتراك..." />;
  }

  if (!isFrozenPhase(phase)) {
    return <>{children}</>;
  }

  if (isFrozenAllowedPath(location.pathname)) {
    return <>{children}</>;
  }

  // Prefer the renew settings surface; fall back to the standalone screen
  // if something already redirected here in a loop-safe way.
  if (location.pathname !== "/settings/subscription") {
    return <Navigate to="/settings/subscription" replace />;
  }

  return <SubscriptionFrozenScreen />;
}

export default SubscriptionLifecycleGate;
