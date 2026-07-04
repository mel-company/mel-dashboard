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
import DeleteCouponDialog from "./DeleteCouponDialog";
import type { useDiscountsPage } from "@/hooks/use-discounts-page";

type CouponsContentProps = {
  actions: ReturnType<typeof useDiscountsPage>;
};

const CouponsContent = ({ actions }: CouponsContentProps) => {
  const navigate = useNavigate();
  const { mutate: toggleCoupon } = useToggleCouponActive();

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
      {actions.viewMode === "table" ? (
        <CouponTable
          coupons={actions.coupons}
          onView={(id) => navigate(`/coupons/${id}`)}
          onEdit={(id) => navigate(`/coupons/${id}/edit`)}
          onDelete={(coupon) => actions.setDeleteCouponTarget(coupon)}
          onToggleStatus={handleToggle}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {actions.coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClick={() => navigate(`/coupons/${coupon.id}`)}
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

      <DeleteCouponDialog
        coupon={actions.deleteCouponTarget}
        onOpenChange={(open) => !open && actions.setDeleteCouponTarget(null)}
        onSuccess={() => actions.couponRefetch()}
      />
    </>
  );
};

export default CouponsContent;
