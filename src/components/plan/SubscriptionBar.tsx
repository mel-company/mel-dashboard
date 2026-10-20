import { AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlanUsage } from "@/hooks/use-plan-limits";
import { cn } from "@/lib/utils";

const daysText = (days: number) =>
  days <= 1 ? "يوم واحد" : days === 2 ? "يومين" : `${days} أيام`;

/**
 * The bar fixed to the top of every dashboard page while the subscription has
 * three days or fewer left, and once it has ended (when order details are
 * closed until the merchant renews). Renewing is on the store settings tab.
 */
export function SubscriptionBar() {
  const navigate = useNavigate();
  const { data } = usePlanUsage();
  const sub = data?.subscription;
  if (!sub || (!sub.expiringSoon && !sub.expired)) return null;

  const expired = Boolean(sub.expired);
  const days = Math.max(0, Number(sub.daysLeft ?? 0));

  return (
    <div
      dir="rtl"
      role="status"
      className={cn(
        "relative z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 text-sm font-medium sm:px-6",
        expired
          ? "bg-red-600 text-white"
          : "bg-amber-400 text-amber-950",
      )}
    >
      {expired ? (
        <AlertTriangle className="size-4 shrink-0" />
      ) : (
        <Clock className="size-4 shrink-0" />
      )}
      <span className="min-w-0 flex-1">
        {expired
          ? "انتهى اشتراكك. متجرك ما زال يستقبل الطلبات، لكن تفاصيل الطلبات مقفلة حتى تجدد."
          : days === 0
            ? "ينتهي اشتراكك اليوم. جدّد الآن حتى لا تُقفل تفاصيل الطلبات."
            : `يتبقى ${daysText(days)} على انتهاء اشتراكك. جدّد الآن حتى لا تُقفل تفاصيل الطلبات.`}
      </span>
      <Button
        size="sm"
        variant={expired ? "secondary" : "default"}
        className="h-8 rounded-full px-4"
        onClick={() => navigate("/settings/store")}
      >
        تجديد الاشتراك
      </Button>
    </div>
  );
}

export default SubscriptionBar;
