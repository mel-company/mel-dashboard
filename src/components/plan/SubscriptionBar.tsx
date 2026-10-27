import { AlertTriangle, Clock, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import { cn } from "@/lib/utils";
import {
  isFrozenPhase,
  isViewOnlyPhase,
} from "@/utils/subscription-lifecycle";

const daysText = (days: number) =>
  days <= 1 ? "يوم واحد" : days === 2 ? "يومين" : `${days} أيام`;

/**
 * Top dashboard strip for renewals: amber while the term is ending or in
 * VIEW_ONLY, red once FROZEN. Matches the product banner (white copy + cyan pill).
 */
export function SubscriptionBar() {
  const navigate = useNavigate();
  const { data } = usePlanUsage();
  const sub = data?.subscription;
  if (!sub) return null;

  const phase = sub.lifecyclePhase;
  const frozen = isFrozenPhase(phase);
  const viewOnly = isViewOnlyPhase(phase) || Boolean(sub.expired && !frozen);
  const expiringSoon = Boolean(sub.expiringSoon) && !viewOnly && !frozen;

  if (!frozen && !viewOnly && !expiringSoon) return null;

  const days = Math.max(0, Number(sub.daysLeft ?? 0));

  const message = frozen
    ? "انتهى اشتراكك منذ أكثر من 7 أيام. جدد الآن أو راسل الدعم لإعادة فتح المتجر."
    : viewOnly
      ? "انتهى اشتراكك. يمكنك استعراض البيانات؛ جدد الآن حتى لا يُجمَّد المتجر."
      : days === 0
        ? "ينتهي اشتراكك اليوم. جدد الآن حتى لا تفقد تفاصيل الطلبات."
        : `يتبقى ${daysText(days)} على انتهاء اشتراكك. جدد الآن حتى لا تفقد تفاصيل الطلبات.`;

  const Icon = frozen ? Lock : viewOnly ? AlertTriangle : Clock;

  return (
    <div
      dir="rtl"
      role="status"
      className={cn(
        "relative z-20 flex shrink-0 items-center gap-3 px-4 py-3 sm:px-6",
        frozen || viewOnly ? "bg-[#e11d48] text-white" : "bg-[#f2af00] text-white",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Icon className="size-[18px] shrink-0 text-white" strokeWidth={2} />
        <p className="min-w-0 text-[13px] font-medium leading-snug sm:text-sm">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/settings/subscription")}
        className={cn(
          "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-bold text-white shadow-none transition-colors",
          "bg-[#00b7ff] hover:bg-[#00a3e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        )}
      >
        تجديد الاشتراك
      </button>
    </div>
  );
}

export default SubscriptionBar;
