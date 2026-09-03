import { FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import TicketTable from "./TicketTable";
import TicketCard from "./TicketCard";
import type { useTicketsPage } from "@/hooks/use-tickets-page";

type TicketsContentProps = {
  actions: ReturnType<typeof useTicketsPage>;
};

const TicketsContent = ({ actions }: TicketsContentProps) => {
  const navigate = useNavigate();

  if (actions.isLoading && actions.tickets.length === 0) {
    return (
      <div className="space-y-3 rounded-3xl border border-transparent bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
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
      <div className="xl:hidden">
        <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b]">
          <div className="mb-2 px-2 pt-1 text-right">
            <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">جميع الفئات</h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
              أجمالي العناصر المتاحة{" "}
              <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">{actions.tickets.length}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {actions.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate(`/tickets/${ticket.id}`)} />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden xl:block">
        <TicketTable tickets={actions.tickets} />
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
    </>
  );
};

export default TicketsContent;
