import { useCallback, useEffect, useRef, useState } from "react";
import { Folder, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CategoryGroupsSkeleton from "@/pages/category/category-group/CategoryGroupsSkeleton";
import AddGroupDialog from "@/pages/category/category-group/AddGroupDialog";
import {
  useFetchGroupsCursor,
  useSearchGroupsCursor,
} from "@/api/wrappers/group.wrappers";
import PageTableHeader from "@/components/table/header";
import SwitchTab from "@/components/table/switch-tab";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";
import GroupTable from "./GroupTable";
import GroupCards from "./GroupCards";
import GroupDeleteModal from "./GroupDeleteModal";

const CURSOR_LIMIT = 20;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debouncedValue;
}

type GroupsContentProps = {
  viewMode: "table" | "cards";
  onViewModeChange: (mode: "table" | "cards") => void;
  isAddOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
};

const GroupsContent = ({
  viewMode,
  onViewModeChange,
  isAddOpen,
  onAddOpenChange,
}: GroupsContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteGroup, setDeleteGroup] = useState<any>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedQuery.length > 0;

  const cursorQuery = useFetchGroupsCursor({ limit: CURSOR_LIMIT }, !isSearching);
  const searchQueryResult = useSearchGroupsCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching,
  );

  const groups = isSearching
    ? (searchQueryResult.data?.pages.flatMap((p) => p.data) ?? [])
    : (cursorQuery.data?.pages.flatMap((p) => p.data) ?? []);

  const imageBaseUrl = isSearching
    ? (searchQueryResult.data?.pages?.[0]?.baseUrl ?? "")
    : (cursorQuery.data?.pages?.[0]?.baseUrl ?? "");

  const hasNextPage = isSearching
    ? searchQueryResult.hasNextPage
    : cursorQuery.hasNextPage;
  const isFetchingNextPage = isSearching
    ? searchQueryResult.isFetchingNextPage
    : cursorQuery.isFetchingNextPage;
  const fetchNextPage = isSearching
    ? searchQueryResult.fetchNextPage
    : cursorQuery.fetchNextPage;
  const error = isSearching ? searchQueryResult.error : cursorQuery.error;
  const refetch = isSearching ? searchQueryResult.refetch : cursorQuery.refetch;
  const isFetching = isSearching
    ? searchQueryResult.isFetching
    : cursorQuery.isFetching;
  const isLoading = isSearching
    ? searchQueryResult.isLoading
    : cursorQuery.isLoading;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore, hasNextPage, isFetchingNextPage]);

  const listTitle = isSearching ? "نتائج البحث" : "جميع المجموعات";
  const listSubtitle = `أجمالي العناصر المتاحة ${groups.length}`;

  const cards = (
    <GroupCards
      groups={groups}
      imageBaseUrl={imageBaseUrl}
      refetch={refetch}
    />
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 lg:hidden">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مجموعة"
                className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
              />
              <Search className="size-5 shrink-0 text-slate-400 dark:text-[#4a5596]" strokeWidth={2.25} />
            </div>
          </div>
          <button
            type="button"
            aria-label="الفلاتر"
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center rounded-[14px] border",
              "border-slate-200 bg-sky-50 text-sky-600",
              "dark:border-[#00b7ff]/15 dark:bg-transparent dark:text-[#33c5ff]",
            )}
          >
            <FilterSlidersIcon size={20} />
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <PageTableHeader
          title={listTitle}
          subtitle={listSubtitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="ابحث عن مجموعة"
        >
          <SwitchTab
            selected={viewMode}
            onChange={(value) => onViewModeChange(value as "table" | "cards")}
          />
        </PageTableHeader>
      </div>

      {isLoading && groups.length === 0 ? (
        <CategoryGroupsSkeleton count={8} showHeader={false} />
      ) : error && groups.length === 0 ? (
        <ErrorPage error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : groups.length === 0 ? (
        <EmptyPage
          title={searchQuery.trim() ? "لا توجد نتائج" : "لا توجد مجموعات"}
          description={
            searchQuery.trim()
              ? "لم يتم العثور على مجموعات تطابق البحث. جرّب كلمات أخرى."
              : "ابدأ بإضافة مجموعة جديدة لعرضها هنا."
          }
          icon={<Folder className="size-7 text-muted-foreground" />}
          primaryAction={
            searchQuery.trim()
              ? {
                  label: "مسح البحث",
                  onClick: () => setSearchQuery(""),
                  icon: <X className="size-4" />,
                  variant: "outline",
                }
              : {
                  label: "إضافة مجموعة",
                  onClick: () => onAddOpenChange(true),
                  icon: <Plus className="size-4" />,
                }
          }
        />
      ) : (
        <>
          <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b] xl:hidden">
            <div className="mb-2 px-2 pt-1 text-right">
              <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">
                {listTitle}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
                أجمالي العناصر المتاحة{" "}
                <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
                  {groups.length}
                </span>
              </p>
            </div>
            {cards}
          </div>
          <div className="hidden xl:block">
            {viewMode === "table" ? (
              <GroupTable
                groups={groups}
                refetch={refetch}
                imageBaseUrl={imageBaseUrl}
              />
            ) : (
              cards
            )}
          </div>
          <div ref={loadMoreRef} />
        </>
      )}

      <GroupDeleteModal
        group={deleteGroup}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        onSuccess={() => refetch()}
        imageBaseUrl={imageBaseUrl}
      />
      <AddGroupDialog open={isAddOpen} onOpenChange={onAddOpenChange} />
    </div>
  );
};

export default GroupsContent;
