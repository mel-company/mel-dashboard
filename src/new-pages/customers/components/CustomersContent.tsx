import { User, X } from "lucide-react";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CustomersSkeleton from "@/pages/customer/CustomersSkeleton";
import CustomerTable from "./CustomerTable";

interface CustomersContentProps {
  actions: any;
}

const CustomersContent = ({ actions }: CustomersContentProps) => {
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
    <CustomerTable
      customers={actions.customers}
      onDelete={actions.setDeleteId}
    />
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
