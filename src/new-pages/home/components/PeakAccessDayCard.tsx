import { Bar, BarChart, Cell, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS, AR_WEEKDAYS } from "../utils";

type PeakAccessDayCardProps = {
  peakDay: string;
  weeklyData: { day: string; value: number }[];
};

const PeakAccessDayCard = ({ peakDay, weeklyData }: PeakAccessDayCardProps) => {
  const peakIndex = weeklyData.reduce(
    (best, item, index, arr) =>
      item.value > (arr[best]?.value ?? 0) ? index : best,
    0,
  );

  return (
    <DashboardCard
      className="min-h-[114px]"
      contentClassName="flex flex-row items-center justify-between gap-3 py-3"
    >
      <div className="min-w-0 text-right">
        <p className="text-xs font-medium text-text-secondary dark:text-foreground">
          افضل ايام الوصول
        </p>
        <p className="mt-0.5 text-lg font-bold text-foreground">{peakDay}</p>
      </div>
      <div className="h-[70px] w-[132px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barCategoryGap="28%">
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
              {weeklyData.map((_, index) => (
                <Cell
                  key={index}
                  fill={
                    index === peakIndex
                      ? CHART_COLORS.purpleSoft
                      : `${CHART_COLORS.purpleSoft}26`
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export const defaultWeeklyAccess = AR_WEEKDAYS.map((day, i) => ({
  day: day.slice(0, 3),
  value: [42, 55, 48, 61, 58, 72, 85][i] ?? 50,
}));

export default PeakAccessDayCard;
