import { Search } from "lucide-react";
import { BaseCard } from "@/components/table/top-cards";
import OrdersContent from "./components/OrdersContent";
import PageTableHeader from "@/components/table/header";
import { useOrdersPage } from "@/hooks/use-orders-page";
import TitleBar from "@/components/table/title-bar";
import { cn } from "@/lib/utils";
import {
  ShoppingCart01Icon,
  Package01Icon,
  CheckmarkCircle03Icon,
  Money04Icon,
} from "@hugeicons-pro/core-stroke-standard";

const OrdersPage = () => {
  const actions = useOrdersPage();

  return (
    <div className="space-y-4 sm:space-y-6">
      <TitleBar count={actions.stats?.totalOrders ?? actions.orders?.length ?? 0} />

      <div className="mb-6 rounded-[28px] bg-slate-50 p-5 dark:bg-transparent md:bg-transparent md:p-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <BaseCard
            icon={Package01Icon}
            title="اجمالي الطلبات المعلقة"
            value={actions.stats?.pendingOrders?.toString() || "0"}
            color="danger"
          />
          <BaseCard
            icon={CheckmarkCircle03Icon}
            title="أجمالي الطلبات المكتملة"
            value={actions.stats?.completedOrders?.toString() || "0"}
            color="success"
          />
          <BaseCard
            icon={ShoppingCart01Icon}
            title="أجمالي الطلبات"
            value={actions.stats?.totalOrders?.toString() || "0"}
            growth={actions.stats?.ordersGrowth}
            color="default"
          />
          <BaseCard
            icon={Money04Icon}
            title="أجمالي مبالغ الطلبات"
            value={actions.stats?.totalAmountLabel || "0"}
            growth={actions.stats?.amountGrowth}
            color="accent"
          />
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        <div
          className={cn(
            "flex min-h-12 min-w-0 items-center justify-between gap-2 rounded-[14px] border px-2",
            "border-slate-200 bg-white",
            "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27]",
          )}
        >
          <span className="flex h-8 shrink-0 items-center rounded-lg bg-sky-50 px-4 text-sm text-sky-600 dark:bg-[#33c5ff]/5 dark:text-[#00b7ff]">
            البحث
          </span>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <input
              type="search"
              value={actions.searchQuery ?? ""}
              onChange={(e) => actions.onSearchChange?.(e.target.value)}
              placeholder="طلب"
              className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
            />
            <Search className="size-5 shrink-0 text-slate-400 dark:text-[#4a5596]" strokeWidth={2.25} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => actions.setIsFilterDialogOpen(true)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-[#00b7ff]/15 dark:bg-[#0a0e27] dark:text-[#33c5ff]"
        >
          الفلاتر
          {actions.hasActiveFilters && (
            <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              +{actions.activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="hidden md:block">
        <PageTableHeader
          title="جميع الطلبات"
          subtitle={`أجمالي الطلبات ${actions.orders.length}`}
          searchQuery={actions.searchQuery}
          onSearchChange={actions.onSearchChange}
          searchPlaceholder="ابحث عن طلب"
          onFilterClick={() => actions.setIsFilterDialogOpen(true)}
          hasActiveFilters={actions.hasActiveFilters}
          activeFilterCount={actions.activeFilterCount}
        />
      </div>

      <OrdersContent actions={actions} />
    </div>
  );
};

export default OrdersPage;
