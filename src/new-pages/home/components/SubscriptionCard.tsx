import { formatCount } from "@/utils/format-currency";
import { formatDateParts } from "@/utils/format-date";

type SubscriptionCardProps = {
  planCode?: string | null;
  planTitle?: string | null;
  /** Figma prints the plan's one-line pitch under its name. */
  planDescription?: string | null;
  expiresAt?: string | null;
  daysLeft?: number;
  /** Percentage of the term elapsed, 0–100. */
  progress?: number;
};

/** Figma shows the expiry with its time: «26/6/2024 - 11:10 am». */
const formatExpiry = (dateString: string | null | undefined) => {
  const { date, time } = formatDateParts(dateString);
  if (date === "—") return date;
  return time ? `${date} - ${time.toLowerCase()}` : date;
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

/** The unit that goes under Figma's large day count. */
const daysUnit = (daysLeft: number) => {
  if (daysLeft === 1) return "يوم واحد";
  if (daysLeft === 2) return "يومان";
  if (daysLeft >= 3 && daysLeft <= 10) return "أيام";
  return "يوم";
};

const SubscriptionCard = ({
  planCode,
  planTitle,
  planDescription,
  expiresAt,
  daysLeft = 0,
  progress = 0,
}: SubscriptionCardProps) => {
  const expired = isSubscriptionExpired(daysLeft, expiresAt);
  // `progress` is a percentage. It used to be clamped to 1 and then
  // multiplied by 100, so anything at or above 1% painted a full bar.
  const fallbackPct = daysLeft > 0 ? Math.min(daysLeft / 30, 1) * 100 : 0;
  const progressPct = Math.round(
    Math.min(Math.max(progress || fallbackPct, 0), 100),
  );

  return (
    <div className="relative min-h-[176px] overflow-hidden rounded-[18px] bg-[#00b7ff] p-5 text-white dark:bg-linear-to-l dark:from-[#33c5ff] dark:to-[#b282ff]">
      {/* RTL: expiry leads on the right, the plan chip sits opposite. */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/75">تاريخ النفاذ</p>
          <p className="mt-0.5 text-sm font-semibold" dir="ltr" lang="en">
            {formatExpiry(expiresAt)}
          </p>
        </div>
        <div
          className="rounded-[14px] bg-white/20 px-3.5 py-2 text-sm font-bold uppercase backdrop-blur-sm tabular-nums"
          lang="en"
        >
          {planCode ?? "—"}
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {expired ? (
            <p className="text-lg font-bold">انتهت الصلاحية</p>
          ) : (
            /* Figma makes the day count display type, not a body line. */
            <p className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold leading-none tabular-nums sm:text-5xl" lang="en">
                {formatCount(daysLeft)}
              </span>
              <span className="text-sm text-white/85">{daysUnit(daysLeft)}</span>
            </p>
          )}
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate text-2xl font-bold leading-snug sm:text-3xl">
            {planTitle ?? "بدون خطة"}
          </p>
          {planDescription ? (
            <p className="mt-1 truncate text-xs text-white/80">
              {planDescription}
            </p>
          ) : null}
        </div>
      </div>

      {!expired ? (
        /* Inset under the day count rather than spanning the whole card. */
        <div className="mt-4 h-2 w-1/2 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
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
