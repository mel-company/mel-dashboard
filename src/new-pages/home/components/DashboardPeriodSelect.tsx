import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_PERIOD_OPTIONS,
  type DashboardPeriod,
} from "../utils";

type DashboardPeriodSelectProps = {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
};

const DashboardPeriodSelect = ({
  value,
  onChange,
}: DashboardPeriodSelectProps) => {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as DashboardPeriod)}
    >
      <SelectTrigger
        aria-label="فترة الإحصائيات"
        className="h-11 w-full min-w-[11rem] rounded-2xl border-border/60 bg-card px-3 text-sm shadow-none sm:w-auto"
      >
        <SelectValue placeholder="اختر الفترة" />
      </SelectTrigger>
      <SelectContent align="end">
        {DASHBOARD_PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DashboardPeriodSelect;
