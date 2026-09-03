import DashboardCard from "./DashboardCard";
import { cn } from "@/lib/utils";

type PeakAccessDayCardProps = {
  peakDay: string;
  weeklyData: { day: string; value: number; label?: string }[];
};

const PeakAccessDayCard = ({ peakDay, weeklyData }: PeakAccessDayCardProps) => {
  const peakIndex = weeklyData.reduce(
    (best, item, index, arr) =>
      item.value > (arr[best]?.value ?? 0) ? index : best,
    0,
  );
  const max = Math.max(...weeklyData.map((d) => d.value), 1);

  return (
    <DashboardCard
      className="min-h-[140px]"
      contentClassName="flex flex-col gap-3 py-3"
    >
      <div className="min-w-0 text-right">
        <p className="truncate text-xs font-medium text-text-secondary dark:text-foreground">
          افضل ايام الوصول
        </p>
        <p className="mt-0.5 truncate text-base font-bold text-foreground sm:text-lg">
          {peakDay}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col items-stretch">
        <div className="flex h-[56px] w-full items-end justify-between gap-1 sm:h-[64px] sm:gap-1.5">
          {weeklyData.map((item, index) => {
            const height = Math.max((item.value / max) * 56, 6);
            const isPeak = index === peakIndex;
            return (
              <div
                key={`${item.day}-${index}`}
                className="flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div
                  className={cn(
                    "w-full max-w-3 rounded-[2px]",
                    isPeak
                      ? "bg-[#7d26f7] dark:bg-[#b282ff]"
                      : "bg-[rgba(125,38,247,0.15)] dark:bg-[#b282ff]/25",
                  )}
                  style={{ height }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex w-full items-center justify-between gap-1">
          {weeklyData.map((item, index) => {
            const isPeak = index === peakIndex;
            return (
              <span
                key={`label-${item.day}-${index}`}
                className={cn(
                  "min-w-0 flex-1 text-center text-[10px] leading-none sm:text-[11px]",
                  isPeak
                    ? "font-bold text-[#7d26f7] dark:text-[#b282ff]"
                    : "font-light text-[#bac2cf] dark:text-muted-foreground",
                )}
              >
                {item.label ?? item.day.charAt(0)}
              </span>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
};

export const defaultWeeklyAccess = [
  { day: "Mon", label: "M", value: 42 },
  { day: "Tue", label: "T", value: 55 },
  { day: "Wed", label: "W", value: 48 },
  { day: "Thu", label: "T", value: 61 },
  { day: "Fri", label: "F", value: 85 },
  { day: "Sat", label: "S", value: 58 },
  { day: "Sun", label: "S", value: 72 },
];

export default PeakAccessDayCard;
