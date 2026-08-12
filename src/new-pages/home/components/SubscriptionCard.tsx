import { Loader2 } from "lucide-react";
import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";

const formatExpiryDate = (dateString: string | undefined) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const daysUntil = (dateString: string | undefined) => {
  if (!dateString) return null;
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const SubscriptionCard = () => {
  const { data: subscription, isLoading } = useFetchStoreSubscription();

  if (isLoading) {
    return (
      <div className="flex min-h-[176px] items-center justify-center rounded-[18px] bg-linear-to-l from-[#00AEEF] to-[#9139C4]">
        <Loader2 className="size-6 animate-spin text-white" />
      </div>
    );
  }

  const planName = subscription?.plan?.name ?? "الاحترافي";
  const expiry = subscription?.end_at;
  const remainingDays = daysUntil(expiry) ?? 24;
  const subId = subscription?.id?.slice(0, 8) ?? "15a33535";

  return (
    <div className="relative min-h-[176px] overflow-hidden rounded-[18px] bg-linear-to-l from-[#33c5ff] to-[#b282ff] p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/75">تاريخ النفاذ</p>
          <p className="mt-0.5 text-sm font-semibold">
            {formatExpiryDate(expiry) || "26/6/2024"}
          </p>
        </div>
        <div className="rounded-2xl bg-white/20 px-3 py-1.5 text-sm font-bold backdrop-blur-sm">
          #{subId}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-4xl font-bold leading-none">{planName}</p>
        <p className="mt-3 text-sm text-white/80">
          متبقي{" "}
          <span className="text-lg font-bold text-white">{remainingDays}</span>{" "}
          يوم
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-white/10 blur-2xl"
      />
    </div>
  );
};

export default SubscriptionCard;
