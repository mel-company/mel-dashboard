import { Loader2 } from "lucide-react";
import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";

const formatExpiryDate = (dateString: string | undefined) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}/${month}/${year} - ${time.toLowerCase()}`;
};

const StorePlanSummaryCard = () => {
  const { data: subscription, isLoading } = useFetchStoreSubscription();

  if (isLoading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-3xl bg-linear-to-r from-[#00b4d8] to-[#9b5de5]">
        <Loader2 className="size-6 animate-spin text-white" />
      </div>
    );
  }

  if (!subscription) return null;

  const plan = subscription.plan;

  return (
    <div
      dir="ltr"
      className="relative min-h-[160px] overflow-hidden rounded-3xl bg-linear-to-r from-[#00b4d8] to-[#9b5de5] p-5 text-white shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {/* يسار البطاقة: تاريخ النفاذ */}
        <div>
          <p className="text-sm font-light text-white/80">تاريخ النفاذ</p>
          <p className="mt-1 text-sm font-semibold">
            {formatExpiryDate(subscription.end_at)}
          </p>
        </div>

        {/* يمين البطاقة: رقم الاشتراك */}
        <div className="rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm">
          <p className="text-sm font-bold tracking-wide">
            #{subscription.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* يمين البطاقة: اسم الباقة والوصف */}
      <div className="mt-10 text-right" dir="rtl">
        <p className="text-3xl font-bold leading-tight">
          {plan?.name ?? "—"}
        </p>
        {plan?.description && (
          <p className="mt-2 text-sm leading-relaxed text-white/90">
            {plan.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StorePlanSummaryCard;
