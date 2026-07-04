import { useNavigate } from "react-router-dom";
import { Loader2, Percent, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useEnableDiscount,
  useDisableDiscount,
} from "@/api/wrappers/discount.wrappers";
import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";
import type { useDiscountsPage } from "@/hooks/use-discounts-page";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import DiscountsSkeleton from "@/pages/discount/DiscountsSkeleton";
import DiscountCard from "./DiscountCard";
import DiscountTable from "./DiscountTable";
import DeleteDiscountDialog from "./DeleteDiscountDialog";

type DiscountsContentProps = {
  actions: ReturnType<typeof useDiscountsPage>;
  onCreateClick: () => void;
};

const DiscountsContent = ({ actions, onCreateClick }: DiscountsContentProps) => {
  const navigate = useNavigate();
  const { discounts, viewMode, deleteTarget, setDeleteTarget } = actions;

  const { mutate: enableDiscount, isPending: isEnabling } = useEnableDiscount();
  const { mutate: disableDiscount, isPending: isDisabling } = useDisableDiscount();

  const handleToggleStatus = (discount: DiscountListItem) => {
    if (discount.discount_status === DISCOUNT_STATUS.EXPIRED) return;

    const isActive = discount.discount_status === DISCOUNT_STATUS.ACTIVE;

    if (isActive) {
      disableDiscount(discount.id, {
        onSuccess: () => {
          toast.success("تم تعطيل الخصم");
          actions.refetch();
        },
        onError: () => toast.error("فشل في تعطيل الخصم"),
      });
    } else {
      enableDiscount(discount.id, {
        onSuccess: () => {
          toast.success("تم تفعيل الخصم");
          actions.refetch();
        },
        onError: () => toast.error("فشل في تفعيل الخصم"),
      });
    }
  };

  const isToggling = isEnabling || isDisabling;
  const hasActiveFilters = actions.hasActiveFilters;

  if (actions.isLoading && discounts.length === 0) {
    return <DiscountsSkeleton count={8} showHeader={false} />;
  }

  if (actions.error && discounts.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (discounts.length === 0) {
    return (
      <EmptyPage
        title={actions.searchQuery || hasActiveFilters ? "لا توجد نتائج" : "لا توجد خصومات"}
        description={
          actions.searchQuery || hasActiveFilters
            ? "لم يتم العثور على خصومات تطابق البحث أو التصفية."
            : "ابدأ بإنشاء خصم جديد لعرضه هنا."
        }
        icon={<Percent className="size-7 text-muted-foreground" />}
        primaryAction={{
          label: "إنشاء خصم جديد",
          onClick: onCreateClick,
          icon: <Plus className="size-4" />,
        }}
      />
    );
  }

  return (
    <>
      {viewMode === "table" ? (
        <DiscountTable
          discounts={discounts}
          onView={(id) => navigate(`/discounts/${id}`)}
          onEdit={(id) => navigate(`/discounts/${id}/edit`)}
          onDelete={(d) => setDeleteTarget(d)}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {discounts.map((discount) => (
              <DiscountCard
                key={discount.id}
                discount={discount}
                onClick={() => navigate(`/discounts/${discount.id}`)}
              />
            ))}
          </div>
          <div ref={actions.loadMoreRef} className="flex justify-center py-4">
            {actions.hasNextPage && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => actions.fetchNextPage()}
                disabled={actions.isFetchingNextPage || isToggling}
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

      <DeleteDiscountDialog
        discount={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onSuccess={() => actions.refetch()}
      />
    </>
  );
};

export default DiscountsContent;
