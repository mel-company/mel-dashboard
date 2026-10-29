import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlusFeature } from "@/api/endpoints/plan.endpoints";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";

const FEATURE_TITLES: Record<PlusFeature, string> = {
  ai_editor: "محرر الذكاء الاصطناعي",
  team_users: "أعضاء الفريق",
  mobile_app: "تطبيق الهاتف",
};

type PlanUpgradeGateProps = {
  feature: PlusFeature;
  /** Optional override; falls back to entitlements.locked[].message */
  message?: string;
  className?: string;
};

/**
 * Full-page / panel upgrade prompt when a PLUS-only feature is locked.
 * Call after checking `usePlanEntitlements().isLocked(feature)`.
 */
export function PlanUpgradeGate({
  feature,
  message,
  className,
}: PlanUpgradeGateProps) {
  const { messageFor, goUpgrade, upgradeTo, isLoading } = usePlanEntitlements();
  const planName = upgradeTo?.planName || "نمو";
  const body =
    message ||
    messageFor(feature) ||
    `${FEATURE_TITLES[feature]} متاح في ${planName} فقط.`;

  return (
    <div
      className={
        className ||
        "flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
      }
      dir="rtl"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50">
        <Lock className="size-7" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          ترقية إلى {planName}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{body}</p>
      </div>
      <Button
        size="lg"
        className="gap-2 rounded-full px-6"
        disabled={isLoading}
        onClick={() => goUpgrade(feature)}
      >
        <Sparkles className="size-4" />
        ترقية الخطة الآن
      </Button>
    </div>
  );
}

export default PlanUpgradeGate;
