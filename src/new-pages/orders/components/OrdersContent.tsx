import { useState, type ReactNode } from "react";
import { Loader2, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import OrdersSkeleton from "@/pages/order/OrdersSkeleton";
import OrderFilterDialog from "@/pages/order/OrderFilterDialog";
import OrderTable from "./OrderTable";
import OrderCard from "./OrderCard";
import OrderDetailsSheet from "./OrderDetailsSheet";

interface OrdersContentProps {
  toolbar?: ReactNode;
  actions: any;
}

const OrdersContent = ({ actions, toolbar }: OrdersContentProps) => {
  // Figma opens an order as an edge drawer over the list, not as a page.
  const [detailsOrder, setDetailsOrder] = useState<any | null>(null);

  return (
    <>
      <OrderDetailsSheet
        order={detailsOrder}
        onOpenChange={(open) => !open && setDetailsOrder(null)}
        imageBaseUrl={actions.imageBaseUrl}
        calculateTotal={actions.calculateTotal}
        onChanged={() => actions.refetch?.()}
      />

      <OrderFilterDialog
        open={actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.filters}
        onApply={actions.setFilters}
        onClear={actions.handleClearFilters}
      />

      {actions.isLoading && actions.orders.length === 0 ? (
        <OrdersSkeleton showHeader={false} rows={6} />
      ) : actions.error && actions.orders.length === 0 ? (
        <ErrorPage
          error={actions.error}
          onRetry={() => actions.refetch()}
          isRetrying={false}
        />
      ) : actions.orders.length === 0 ? (
        <EmptyCard actions={actions} />
      ) : (
        <>
          <div className="xl:hidden">
            <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b]">
              <div className="mb-2 px-2 pt-1 text-right">
                <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">
                  جميع الطلبات
                </h2>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
                  أجمالي الطلبات{" "}
                  <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
                    {actions.orders.length}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                {actions.orders.map((order: any) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    imageBaseUrl={actions.imageBaseUrl}
                    calculateTotal={actions.calculateTotal}
                    onClick={() => setDetailsOrder(order)}
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
            <OrderTable
            toolbar={toolbar}
              orders={actions.orders}
              imageBaseUrl={actions.imageBaseUrl}
              calculateTotal={actions.calculateTotal}
              onOpenOrder={setDetailsOrder}
            />
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
        </>
      )}
    </>
  );
};

export default OrdersContent;

const EmptyCard = ({ actions }: { actions: any }) => {
  const hasFilters = actions.search || actions.hasActiveFilters;

  return (
    <EmptyPage
      title={hasFilters ? "لا توجد نتائج" : "لا توجد طلبات"}
      description={
        hasFilters
          ? "لم يتم العثور على طلبات تطابق البحث أو التصفية."
          : "لم يتم العثور على طلبات."
      }
      icon={<Package className="size-7 text-muted-foreground" />}
      primaryAction={
        hasFilters
          ? {
              label: "مسح البحث والتصفية",
              onClick: () => {
                actions.setSearchValue("");
                actions.handleClearFilters();
              },
              icon: <X className="size-4" />,
              variant: "outline" as const,
            }
          : undefined
      }
    />
  );
};
