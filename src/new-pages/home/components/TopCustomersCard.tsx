import DashboardCard from "./DashboardCard";
import { cn } from "@/lib/utils";

type TopCustomer = {
  id: string;
  name: string;
  phone: string;
  points: number;
  avatar?: string;
};

type TopCustomersCardProps = {
  customers: TopCustomer[];
};

const TopCustomersCard = ({ customers }: TopCustomersCardProps) => {
  return (
    <DashboardCard
      title="أفضل العملاء"
      className="min-h-[280px]"
      contentClassName="space-y-3"
    >
      {customers.slice(0, 5).map((customer) => (
        <div
          key={customer.id}
          className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-white/3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#9139C4] text-xs font-bold text-white">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              customer.name.slice(0, 2)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-white/90">
              {customer.name}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-white/40" dir="ltr">
              {customer.phone}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
              customer.points >= 0
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
            )}
          >
            {customer.points >= 0 ? "+" : ""}
            {customer.points}
          </span>
        </div>
      ))}
    </DashboardCard>
  );
};

export default TopCustomersCard;
