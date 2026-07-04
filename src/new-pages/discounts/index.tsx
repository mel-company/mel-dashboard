import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const DiscountsPage = () => {
  const navigate = useNavigate();
  const actions = useDiscountsPage();
  const isDiscountsTab = actions.activeTab === "discounts";

  return (
    <div className="space-y-6">
      <TitleBar description="تمتلك حركات جديدة في قائمة الخصومات والكوبونات">
        <div className="flex flex-wrap items-center gap-2">
          <SwitchTab
            selected={actions.activeTab}
            onChange={(v) => actions.setActiveTab(v as "discounts" | "coupons")}
            options={[
              { label: "الخصومات", value: "discounts", icon: DiscountTag01Icon },
              { label: "الكوبونات", value: "coupons", icon: Coupon02Icon },
            ]}
          />
          <Button
            className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
            onClick={() => actions.setIsCreateDialogOpen(true)}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            {isDiscountsTab ? "إنشاء خصم جديد" : "إنشاء كوبون جديد"}
          </Button>
        </div>
      </TitleBar>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isDiscountsTab ? (
          <>
            <FeaturedCard
              icon={Money04Icon}
              strokedIcon={Money04IconStroked}
              title="سعر الخصم الكلي"
              value={actions.discountStats.totalUsageAmount.toLocaleString("ar-IQ")}
              color="orange"
            />
            <BaseCard
              icon={TrendingUp}
              title="إجمالي مبالغ الخصومات"
              value={actions.discountStats.totalUsageAmount.toLocaleString("ar-IQ")}
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
              value={actions.couponStats.totalDiscountedAmount.toLocaleString("ar-IQ")}
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

      <PageTableHeader
        title={isDiscountsTab ? "جميع الخصومات" : "جميع الكوبونات"}
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
