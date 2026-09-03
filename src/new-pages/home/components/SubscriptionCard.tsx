import { formatCount } from "@/utils/format-currency";

type SubscriptionCardProps = {
  planCode?: string | null;
  planTitle?: string | null;
  expiresAt?: string | null;
  daysLeft?: number;
  progress?: number;
};

const formatExpiryDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear());
  return `${d}/${m}/${y}`;
};

const isSubscriptionExpired = (
  daysLeft: number,
  expiresAt?: string | null,
) => {
  if (daysLeft <= 0) return true;
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() < Date.now();
};

const formatDaysLeftLabel = (daysLeft: number) => {
  const n = formatCount(daysLeft);
  if (daysLeft === 1) return "متبقي يوم واحد";
  if (daysLeft === 2) return "متبقي يومان";
  if (daysLeft >= 3 && daysLeft <= 10) return `متبقي ${n} أيام`;
  return `متبقي ${n} يوم`;
};

const SubscriptionCard = ({
  planCode,
  planTitle,
  expiresAt,
  daysLeft = 0,
  progress = 0,
}: SubscriptionCardProps) => {
  const expired = isSubscriptionExpired(daysLeft, expiresAt);
  const progressPct = Math.round(
    Math.min(Math.max(progress || (daysLeft > 0 ? Math.min(daysLeft / 30, 1) : 0), 0), 1) *
      100,
  );

  return (
    <div className="relative min-h-[176px] overflow-hidden rounded-[18px] bg-[#00b7ff] p-5 text-white dark:bg-linear-to-l dark:from-[#33c5ff] dark:to-[#b282ff]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/75">تاريخ النفاذ</p>
          <p className="mt-0.5 text-sm font-semibold">
            {formatExpiryDate(expiresAt)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/20 px-3 py-1.5 text-sm font-bold backdrop-blur-sm tabular-nums" lang="en">
          {planCode ?? "—"}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-2xl font-bold leading-snug sm:text-3xl">
          {planTitle ?? "بدون خطة"}
        </p>
        <p className="mt-2 text-sm text-white/80 tabular-nums" lang="en">
          {expired ? (
            <span className="text-lg font-bold text-white">انتهت الصلاحية</span>
          ) : (
            formatDaysLeftLabel(daysLeft)
          )}
        </p>
      </div>

      {!expired ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <div
            className="ms-auto h-full rounded-full bg-white"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-white/10 blur-2xl"
      />
    </div>
  );
};

export default SubscriptionCard;
