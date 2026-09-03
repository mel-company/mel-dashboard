import DashboardCard from "./DashboardCard";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { CHART_COLORS } from "../utils";
import { formatCount } from "@/utils/format-currency";

type TopCustomer = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  rank?: number;
  avatar?: string | null;
};

type TopCustomersCardProps = {
  customers: TopCustomer[];
};

const TopCustomersCard = ({ customers }: TopCustomersCardProps) => {
  const imageBaseUrl = useImageBaseUrl();

  if (customers.length === 0) {
    return (
      <DashboardCard
        title="أفضل العملاء"
        className="min-h-[200px]"
        contentClassName="flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">لا يوجد عملاء بعد</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="أفضل العملاء"
      className="min-h-[280px]"
      contentClassName="space-y-0 px-3 py-1 sm:px-4"
    >
      {customers.slice(0, 5).map((customer, index) => {
        const rank = customer.rank ?? index + 1;
        return (
          <div
            key={customer.id}
            className="flex h-[52px] items-center gap-2"
          >
            <span
              className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-normal tabular-nums"
              lang="en"
              style={{
                backgroundColor: "rgba(125, 38, 247, 0.05)",
                color: CHART_COLORS.brandPurple,
              }}
            >
              +{formatCount(customer.orders)}
            </span>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[11px] leading-normal text-text-secondary dark:text-foreground">
                  {customer.name}
                </p>
                <p
                  className="truncate text-[9px] leading-normal tabular-nums text-[#666] dark:text-muted-foreground"
                  dir="ltr"
                  lang="en"
                >
                  {customer.phone}
                </p>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-muted">
                <AssetImage
                  image={customer.avatar}
                  baseUrl={imageBaseUrl}
                  alt={customer.name}
                  className="size-8 rounded-[6px] object-cover"
                  fallback={
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {customer.name.slice(0, 2)}
                    </span>
                  }
                />
              </div>
              <p
                className="w-6 shrink-0 text-center text-xs tabular-nums text-[#d0d5dd]"
                lang="en"
              >
                <span className="font-normal">#</span>
                <span
                  className="font-bold"
                  style={{ color: CHART_COLORS.brandPurple }}
                >
                  {formatCount(rank)}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </DashboardCard>
  );
};

export default TopCustomersCard;
