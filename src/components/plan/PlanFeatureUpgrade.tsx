import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanFeatureKey } from "@/api/endpoints/plan.endpoints";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";

const FEATURE_COPY: Record<PlanFeatureKey, string> = {
  custom_domain: "ربط نطاقك الخاص أو شراء نطاق جديد",
  social_pixels: "ربط بكسلات الإعلانات (ميتا، تيك توك، سناب شات)",
};

/** An inline upgrade panel where a Grow-only feature would be. */
export function PlanFeatureUpgrade({ feature }: { feature: PlanFeatureKey }) {
  const { goUpgrade, upgradeTo } = usePlanEntitlements();
  const planName = upgradeTo?.planName || "نمو";
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center gap-3 rounded-2xl bg-violet-500/5 px-5 py-8 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
        <Lock className="size-5" />
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {FEATURE_COPY[feature]} متاح في باقة {planName}. رقِّ باقتك لتفعيله.
      </p>
      <Button className="gap-2 rounded-full" onClick={() => goUpgrade()}>
        <Sparkles className="size-4" />
        ترقية إلى {planName}
      </Button>
    </div>
  );
}
