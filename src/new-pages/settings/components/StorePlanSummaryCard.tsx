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
      <div className="flex min-h-[176px] items-center justify-center rounded-[18px] bg-linear-to-br from-sky-500 to-violet-600">
        <Loader2 className="size-6 animate-spin text-white" />
      </div>
    );
  }

  if (!subscription) return null;

  const plan = subscription.plan;

  return (
    <div className="relative min-h-[176px] overflow-hidden rounded-[18px] bg-linear-to-br from-sky-500 to-violet-600 p-5 text-white shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">تاريخ النفاذ</p>
          <p className="mt-0.5 text-sm font-bold">
            {formatExpiryDate(subscription.end_at)}
          </p>
        </div>
        <div className="rounded-xl bg-white/15 px-[18px] py-[13px]">
          <p className="text-sm font-bold tracking-wide">
            #{String(subscription.id).slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="mt-8 text-right">
        <p className="text-[32px] font-extrabold leading-8">
          {plan?.name ?? "—"}
        </p>
        {plan?.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-8 text-white">
            {plan.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StorePlanSummaryCard;
