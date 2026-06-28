import { FileText, Loader2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import TicketTable from "./TicketTable";
import type { useTicketsPage } from "@/hooks/use-tickets-page";

type TicketsContentProps = {
  actions: ReturnType<typeof useTicketsPage>;
};

const TicketsContent = ({ actions }: TicketsContentProps) => {
  if (actions.isLoading && actions.tickets.length === 0) {
    return (
      <div className="space-y-3 rounded-3xl bg-white p-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (actions.error && actions.tickets.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (actions.tickets.length === 0) {
    const hasQuery =
      actions.search.trim() || actions.hasActiveFilters;

    return (
      <EmptyPage
        title={hasQuery ? "لا توجد نتائج" : "لا توجد تذاكر"}
        description={
          hasQuery
            ? "لم يتم العثور على تذاكر تطابق البحث أو التصفية"
            : "ليس لديك تذاكر دعم حالياً. يمكنك فتح تذكرة جديدة للتواصل مع فريق الدعم"
        }
        icon={<FileText className="size-7 text-muted-foreground" />}
        primaryAction={
          hasQuery
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
  }

  return (
    <>
      <TicketTable tickets={actions.tickets} />
      <div ref={actions.loadMoreRef} className="flex justify-center py-4">
        {actions.hasNextPage && actions.isFetchingNextPage && (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        )}
      </div>
    </>
  );
};

export default TicketsContent;
