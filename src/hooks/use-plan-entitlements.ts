import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  isFeatureLocked,
  lockedFeatureMessage,
  useFetchEntitlements,
  useFetchPlans,
} from "@/api/wrappers/plan.wrappers";
import type {
  PlanUpgradeErrorBody,
  PlusFeature,
} from "@/api/endpoints/plan.endpoints";

export function isPlanUpgradeRequiredError(
  err: unknown,
): err is { response: { data: PlanUpgradeErrorBody; status: 403 } } {
  const data = (err as { response?: { data?: Partial<PlanUpgradeErrorBody> } })
    ?.response?.data;
  return data?.code === "PLAN_UPGRADE_REQUIRED";
}

export function usePlanEntitlements() {
  const navigate = useNavigate();
  const entitlementsQuery = useFetchEntitlements();
  const plansQuery = useFetchPlans({ limit: 50 });

  const plusPlanId = useMemo(() => {
    const list = Array.isArray(plansQuery.data)
      ? plansQuery.data
      : plansQuery.data?.data || [];
    const plus = list.find(
      (plan: { code?: string }) =>
        String(plan.code || "").toUpperCase() === "PLUS",
    );
    return plus?.id as string | undefined;
  }, [plansQuery.data]);

  const isLocked = (feature: PlusFeature) =>
    isFeatureLocked(entitlementsQuery.data, feature);

  const messageFor = (feature: PlusFeature) =>
    lockedFeatureMessage(entitlementsQuery.data, feature);

  const goUpgrade = (feature?: PlusFeature) => {
    if (plusPlanId) {
      navigate(`/payment/${plusPlanId}`, {
        state: feature ? { upgradeReason: feature } : undefined,
      });
      return;
    }
    navigate("/settings/store");
  };

  const handleUpgradeError = (err: unknown, fallback = "حدث خطأ") => {
    if (isPlanUpgradeRequiredError(err)) {
      const body = err.response.data;
      toast.error(
        body.message ||
          `هذه الميزة تتطلب باقة ${body.upgrade?.planName || entitlementsQuery.data?.upgradeTo?.planName || "نمو"}`,
      );
      goUpgrade(body.feature);
      return true;
    }
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || fallback,
    );
    return false;
  };

  return {
    ...entitlementsQuery,
    isLocked,
    messageFor,
    plusPlanId,
    goUpgrade,
    handleUpgradeError,
    upgradeAvailable: Boolean(entitlementsQuery.data?.upgradeAvailable),
    upgradeTo: entitlementsQuery.data?.upgradeTo ?? null,
  };
}
