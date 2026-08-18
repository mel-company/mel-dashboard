import { Loader2, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CustomersSkeleton from "@/pages/customer/CustomersSkeleton";
import CustomerTable from "./CustomerTable";
import CustomerCard from "./CustomerCard";

interface CustomersContentProps {
  actions: any;
}

const CustomersContent = ({ actions }: CustomersContentProps) => {
  const navigate = useNavigate();

  if (actions.isLoading && actions.customers.length === 0) {
    return <CustomersSkeleton showHeader={false} rows={6} />;
  }

  if (actions.error && actions.customers.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (actions.customers.length === 0) {
    return <EmptyCard actions={actions} />;
  }

  return (
    <>
      <div className="md:hidden">
        <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b]">
          <div className="mb-2 px-2 pt-1 text-right">
            <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">جميع العملاء</h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
              أجمالي العناصر المتاحة{" "}
              <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
                {actions.customers.length}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {actions.customers.map((customer: any) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => navigate(`/customers/${customer.id}`)}
                onDelete={() => actions.setDeleteId(customer.id)}
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

      <div className="hidden md:block">
        <CustomerTable
          customers={actions.customers}
          onDelete={actions.setDeleteId}
        />
      </div>
    </>
  );
};

export default CustomersContent;

const EmptyCard = ({ actions }: { actions: any }) => {
  const hasSearch = actions.search;

  return (
    <EmptyPage
      title={hasSearch ? "لا توجد نتائج" : "لا يوجد عملاء"}
      description={
        hasSearch
          ? "لم يتم العثور على عملاء يطابقون البحث"
          : "سيظهر العملاء هنا عند تسجيلهم عبر المنصة"
      }
      icon={<User className="size-7 text-muted-foreground" />}
      primaryAction={
        hasSearch
          ? {
              label: "مسح البحث",
              onClick: () => actions.setSearchValue(""),
              icon: <X className="size-4" />,
              variant: "outline" as const,
            }
          : undefined
      }
    />
  );
};
