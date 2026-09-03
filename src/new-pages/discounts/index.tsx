import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  DiscountTag01Icon,
  Coupon02Icon,
  TrendingUp,
  PercentIcon,
  Money04Icon,
} from "@hugeicons-pro/core-stroke-standard";
import { Money04Icon as Money04IconStroked } from "@hugeicons-pro/core-stroke-rounded";
import { BaseCard, FeaturedCard } from "@/components/table/top-cards";
import PageTableHeader from "@/components/table/header";
import SwitchTab from "@/components/table/switch-tab";
import TitleBar from "@/components/table/title-bar";
import DiscountFilterDialog from "@/pages/discount/DiscountFilterDialog";
import CouponFilterDialog from "@/pages/coupone/CouponFilterDialog";
import { useDiscountsPage } from "@/hooks/use-discounts-page";
import DiscountsContent from "./components/DiscountsContent";
import CouponsContent from "./components/CouponsContent";
import CreateDiscountDialog from "./components/CreateDiscountDialog";
import CreateCouponDialog from "./components/CreateCouponDialog";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/format-currency";

const tabOptions = [
  { label: "الخصومات", value: "discounts", icon: DiscountTag01Icon },
  { label: "الكوبونات", value: "coupons", icon: Coupon02Icon },
];

const DiscountsPage = () => {
  const navigate = useNavigate();
  const actions = useDiscountsPage();
  const isDiscountsTab = actions.activeTab === "discounts";
  const listTitle = isDiscountsTab ? "جميع الخصومات" : "جميع الكوبونات";
  const listCount = isDiscountsTab
    ? actions.discounts.length
    : actions.coupons.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="hidden md:block">
        <TitleBar
          count={listCount}
          listLabel={isDiscountsTab ? "الخصومات" : "الكوبونات"}
        >
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              className="h-12 w-full shrink-0 gap-2 rounded-[14px] bg-violet-100 px-4 text-violet-700 shadow-sm hover:bg-violet-200 sm:w-auto sm:gap-2.5 sm:px-5 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20"
              onClick={() => actions.setIsCreateDialogOpen(true)}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
                <Plus className="size-3.5" strokeWidth={2.5} />
              </span>
              <span className="truncate">
                {isDiscountsTab ? "أضافة خصم جديد" : "أضافة كوبون جديد"}
              </span>
            </Button>
            <SwitchTab
              selected={actions.activeTab}
              onChange={(v) => actions.setActiveTab(v as "discounts" | "coupons")}
              accent="violet"
              options={tabOptions}
            />
          </div>
        </TitleBar>
      </div>

      <div className="space-y-3 md:hidden">
        <SwitchTab
          selected={actions.activeTab}
          onChange={(v) => actions.setActiveTab(v as "discounts" | "coupons")}
          accent="violet"
          options={tabOptions}
        />
        <Button
          className="h-12 w-full gap-2 rounded-[14px] bg-violet-100 text-violet-700 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          onClick={() => actions.setIsCreateDialogOpen(true)}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
            <Plus className="size-3.5" strokeWidth={2.5} />
          </span>
          {isDiscountsTab ? "أضافة خصم جديد" : "أضافة كوبون جديد"}
        </Button>
      </div>

      <div className="mb-6 rounded-[28px] bg-slate-50 p-5 dark:bg-transparent md:bg-transparent md:p-0">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {isDiscountsTab ? (
            <>
              <FeaturedCard
                icon={Money04Icon}
                strokedIcon={Money04IconStroked}
                title="سعر الخصم الكلي"
                value={formatNumber(actions.discountStats.totalUsageAmount)}
                suffix="د.ع"
                color="orange"
              />
              <BaseCard
                icon={TrendingUp}
                title="إجمالي مبالغ الخصومات"
                value={formatNumber(actions.discountStats.totalUsageAmount)}
                growth={12.6}
                color="success"
              />
              <BaseCard
                icon={PercentIcon}
                title="إجمالي الخصومات النشطة"
                value={actions.discountStats.activeDiscounts.toString()}
                growth={12.6}
                color="accent"
              />
              <BaseCard
                icon={DiscountTag01Icon}
                title="أعلى قيمة خصم"
                value={`${actions.discountStats.highestDiscount}%`}
                growth={12.6}
                color="warning"
              />
            </>
          ) : (
            <>
              <FeaturedCard
                icon={Money04Icon}
                strokedIcon={Money04IconStroked}
                title="إجمالي المبالغ المخصومة"
                value={formatNumber(actions.couponStats.totalDiscountedAmount)}
                suffix="د.ع"
                color="orange"
              />
              <BaseCard
                icon={Coupon02Icon}
                title="إجمالي الكوبونات الفعالة"
                value={String(actions.couponStats.activeCoupons)}
                growth={12.6}
                color="success"
              />
              <BaseCard
                icon={TrendingUp}
                title="إجمالي استخدام الكوبونات الفعالة"
                value={String(actions.couponStats.activeCouponsUsage)}
                growth={12.6}
                color="accent"
              />
              <BaseCard
                icon={PercentIcon}
                title="أعلى قيمة خصم"
                value={`${actions.couponStats.highestDiscount}%`}
                growth={12.6}
                color="warning"
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-[14px] border px-2",
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
                value={actions.searchQuery}
                onChange={(e) => actions.onSearchChange(e.target.value)}
                placeholder={isDiscountsTab ? "خصم" : "كوبون"}
                className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
              />
              <Search className="size-5 shrink-0 text-slate-400 dark:text-[#4a5596]" strokeWidth={2.25} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => actions.setIsFilterDialogOpen(true)}
            aria-label="الفلاتر"
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center rounded-[14px] border",
              "border-slate-200 bg-sky-50 text-sky-600",
              "dark:border-[#00b7ff]/15 dark:bg-transparent dark:text-[#33c5ff]",
            )}
          >
            <FilterSlidersIcon size={20} />
            {actions.hasActiveFilters && actions.activeFilterCount > 0 ? (
              <span className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                +{actions.activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <PageTableHeader
          title={listTitle}
          subtitle={`أجمالي العناصر المتاحة ${listCount}`}
          searchQuery={actions.searchQuery}
          onSearchChange={actions.onSearchChange}
          searchPlaceholder={
            isDiscountsTab ? "ابحث في الخصومات..." : "ابحث في الكوبونات..."
          }
          onFilterClick={() => actions.setIsFilterDialogOpen(true)}
          hasActiveFilters={actions.hasActiveFilters}
          activeFilterCount={actions.activeFilterCount}
        >
          <SwitchTab
            selected={actions.viewMode}
            onChange={(v) => actions.handleViewModeChange(v as "table" | "cards")}
          />
        </PageTableHeader>
      </div>

      {isDiscountsTab ? (
        <DiscountsContent
          actions={actions}
          onCreateClick={() => actions.setIsCreateDialogOpen(true)}
        />
      ) : (
        <CouponsContent actions={actions} />
      )}

      <DiscountFilterDialog
        open={isDiscountsTab && actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.discountFilters}
        onApply={actions.setDiscountFilters}
        onClear={actions.handleClearDiscountFilters}
      />

      <CouponFilterDialog
        open={!isDiscountsTab && actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.couponFilters}
        onApply={actions.setCouponFilters}
        onClear={actions.handleClearCouponFilters}
      />

      <CreateDiscountDialog
        open={isDiscountsTab && actions.isCreateDialogOpen}
        onOpenChange={actions.setIsCreateDialogOpen}
        onSuccess={(id) => navigate(`/discounts/${id}`)}
      />

      <CreateCouponDialog
        open={!isDiscountsTab && actions.isCreateDialogOpen}
        onOpenChange={actions.setIsCreateDialogOpen}
        onSuccess={(id) => navigate(`/coupons/${id}`)}
      />
    </div>
  );
};

export default DiscountsPage;
