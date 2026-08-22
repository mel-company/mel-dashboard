type SubscriptionCardProps = {
  planCode?: string | null;
  planTitle?: string | null;
  expiresAt?: string | null;
  daysLeft?: number;
};

const formatExpiryDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
  if (daysLeft === 1) return "متبقي يوم واحد";
  if (daysLeft === 2) return "متبقي يومان";
  if (daysLeft >= 3 && daysLeft <= 10) return `متبقي ${daysLeft} أيام`;
  return `متبقي ${daysLeft} يوم`;
};

const SubscriptionCard = ({
  planCode,
  planTitle,
  expiresAt,
  daysLeft = 0,
}: SubscriptionCardProps) => {
  const expired = isSubscriptionExpired(daysLeft, expiresAt);

  return (
    <div className="relative min-h-[176px] overflow-hidden rounded-[18px] bg-linear-to-l from-[#33c5ff] to-[#b282ff] p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/75">تاريخ النفاذ</p>
          <p className="mt-0.5 text-sm font-semibold">
            {formatExpiryDate(expiresAt)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/20 px-3 py-1.5 text-sm font-bold backdrop-blur-sm">
          {planCode ?? "—"}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-4xl font-bold leading-none">
          {planTitle ?? "بدون خطة"}
        </p>
        <p className="mt-3 text-sm text-white/80">
          {expired ? (
            <span className="text-lg font-bold text-white">انتهت الصلاحية</span>
          ) : (
            formatDaysLeftLabel(daysLeft)
          )}
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
