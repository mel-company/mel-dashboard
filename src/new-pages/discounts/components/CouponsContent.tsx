import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Ticket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useToggleCouponActive } from "@/api/wrappers/coupon.wrappers";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import DiscountsSkeleton from "@/pages/discount/DiscountsSkeleton";
import type { CouponListItem } from "@/api/types/coupon";
import { isCouponExpired } from "../coupon-utils";
import CouponCard from "./CouponCard";
import CouponTable from "./CouponTable";
import CouponDetailsSheet from "./CouponDetailsSheet";
import DeleteCouponDialog from "./DeleteCouponDialog";
import type { useDiscountsPage } from "@/hooks/use-discounts-page";

type CouponsContentProps = {
  toolbar?: ReactNode;
  actions: ReturnType<typeof useDiscountsPage>;
};

const CouponsContent = ({ actions, toolbar }: CouponsContentProps) => {
  const navigate = useNavigate();
  const { mutate: toggleCoupon } = useToggleCouponActive();
  // Figma opens coupon details as an edge drawer over the list, not as a page.
  const [detailsCoupon, setDetailsCoupon] = useState<CouponListItem | null>(null);

  const handleToggle = (coupon: CouponListItem) => {
    if (isCouponExpired(coupon)) return;

    toggleCoupon(coupon.id, {
      onSuccess: () => {
        toast.success(coupon.isActive ? "تم تعطيل الكوبون" : "تم تفعيل الكوبون");
        actions.couponRefetch();
      },
      onError: () => toast.error("فشل في تحديث حالة الكوبون"),
    });
  };

  if (actions.isLoading && actions.coupons.length === 0) {
    return <DiscountsSkeleton count={8} showHeader={false} />;
  }

  if (actions.error && actions.coupons.length === 0) {
    return (
      <ErrorPage error={actions.error} onRetry={() => actions.refetch()} isRetrying={false} />
    );
  }

  if (actions.coupons.length === 0) {
    return (
      <EmptyPage
        title={actions.searchQuery || actions.hasActiveFilters ? "لا توجد نتائج" : "لا توجد كوبونات"}
        description={
          actions.searchQuery || actions.hasActiveFilters
            ? "لم يتم العثور على كوبونات تطابق البحث أو التصفية."
            : "ابدأ بإنشاء كوبون جديد لعرضه هنا."
        }
        icon={<Ticket className="size-7 text-muted-foreground" />}
        primaryAction={{
          label: "إنشاء كوبون جديد",
          onClick: () => actions.setIsCreateDialogOpen(true),
          icon: <Plus className="size-4" />,
        }}
      />
    );
  }

  return (
    <>
      <div className="xl:hidden">
        <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b]">
          <div className="mb-2 px-2 pt-1 text-right">
            <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">جميع الكوبونات</h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
              أجمالي العناصر المتاحة{" "}
              <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
                {actions.coupons.length}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {actions.coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClick={() => setDetailsCoupon(coupon)}
                onToggleStatus={handleToggle}
              />
            ))}
          </div>
        </div>
        <div ref={actions.loadMoreRef} className="flex justify-center py-4">
          {actions.hasNextPage && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => actions.fetchNextPage()}
              disabled={actions.isFetchingNextPage}
            >
              {actions.isFetchingNextPage ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                "تحميل المزيد"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="hidden xl:block">
        {actions.viewMode === "table" ? (
          <CouponTable
            toolbar={toolbar}
            coupons={actions.coupons}
            onView={(id) =>
              setDetailsCoupon(
                actions.coupons.find((c) => c.id === id) ?? null,
              )
            }
            onEdit={(id) => navigate(`/coupons/${id}/edit`)}
            onDelete={(coupon) => actions.setDeleteCouponTarget(coupon)}
            onToggleStatus={handleToggle}
          />
        ) : (
          <div className="space-y-4">
            {/* The view toggle lives in this toolbar, and the toolbar lives
                inside the table card — so rendering it only in table mode
                removed the only way back. `viewMode` is persisted, so that
                left the page stuck in cards for good. */}
            {toolbar ? (
              <div className="rounded-3xl bg-white p-4 dark:bg-[#0a0e27]">
                {toolbar}
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {actions.coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onClick={() => setDetailsCoupon(coupon)}
                  onToggleStatus={handleToggle}
                />
              ))}
            </div>
            <div ref={actions.loadMoreRef} className="flex justify-center py-4">
              {actions.hasNextPage && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => actions.fetchNextPage()}
                  disabled={actions.isFetchingNextPage}
                >
                  {actions.isFetchingNextPage ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    "تحميل المزيد"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CouponDetailsSheet
        coupon={detailsCoupon}
        onOpenChange={(open) => !open && setDetailsCoupon(null)}
        onDelete={(coupon) => actions.setDeleteCouponTarget(coupon)}
        onChanged={() => actions.couponRefetch()}
      />

      <DeleteCouponDialog
        coupon={actions.deleteCouponTarget}
        onOpenChange={(open) => !open && actions.setDeleteCouponTarget(null)}
        onSuccess={() => actions.couponRefetch()}
      />
    </>
  );
};

export default CouponsContent;
