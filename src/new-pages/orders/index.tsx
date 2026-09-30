import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BaseCard } from "@/components/table/top-cards";
import OrdersContent from "./components/OrdersContent";
import PageTableHeader from "@/components/table/header";
import { useOrdersPage } from "@/hooks/use-orders-page";
import TitleBar from "@/components/table/title-bar";
import { cn } from "@/lib/utils";
import PagePanel from "@/components/PagePanel";
import {
  ShoppingCart01Icon,
  Package01Icon,
  CheckmarkCircle03Icon,
  Money04Icon,
} from "@hugeicons-pro/core-stroke-standard";

const OrdersPage = () => {
  const navigate = useNavigate();
  const actions = useOrdersPage();

  // Figma keeps the list toolbar inside the table card, not above it.
  const listToolbar = (
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
  );

  return (
    <PagePanel className="space-y-4 sm:space-y-6">
      <div className="hidden lg:block">
        <TitleBar count={actions.stats?.totalOrders ?? actions.orders?.length ?? 0}>
          <Button
            className="h-11 w-full shrink-0 gap-2 rounded-full bg-violet-100 px-4 text-violet-700 shadow-sm hover:bg-violet-200 sm:w-auto sm:gap-2.5 sm:px-5 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20"
            onClick={() => navigate("/orders/add")}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            <span className="truncate">انشاء طلب جديد</span>
          </Button>
        </TitleBar>
      </div>

      <div className="lg:hidden">
        <Button
          className="h-12 w-full gap-2 rounded-full bg-violet-100 text-violet-700 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          onClick={() => navigate("/orders/add")}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
          انشاء طلب جديد
        </Button>
      </div>

      <div className="mb-6 rounded-[28px] bg-slate-50 p-4 dark:bg-white/[0.03] md:bg-transparent md:p-0 md:dark:bg-transparent">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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

      <div className="space-y-3 lg:hidden">
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


      <OrdersContent actions={actions} toolbar={listToolbar} />
    </PagePanel>
  );
};

export default OrdersPage;
