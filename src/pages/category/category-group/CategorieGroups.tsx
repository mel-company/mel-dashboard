import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import AddGroupDialog from "./AddGroupDialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Folder, CheckCircle2, X, Loader2 } from "lucide-react";
import {
  useFetchGroupsCursor,
  useSearchGroupsCursor,
} from "@/api/wrappers/group.wrappers";
import ErrorPage from "../../miscellaneous/ErrorPage";
import EmptyPage from "../../miscellaneous/EmptyPage";
import CategoryGroupsSkeleton from "./CategoryGroupsSkeleton";

type GroupListItem = {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  image: string | null;
  _count?: { categories: number };
};

const CURSOR_LIMIT = 20;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const CategorieGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedQuery.length > 0;

  const {
    data: cursorData,
    fetchNextPage: fetchNextCursor,
    hasNextPage: hasNextCursor,
    isFetchingNextPage: isFetchingNextCursor,
    isLoading: isCursorLoading,
    error: cursorError,
    refetch: refetchCursor,
    isFetching: isCursorFetching,
  } = useFetchGroupsCursor({ limit: CURSOR_LIMIT }, !isSearching);

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchGroupsCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching,
  );

  const flatGroups = cursorData?.pages.flatMap((p) => p.data) ?? [];
  const flatSearchGroups = searchData?.pages.flatMap((p) => p.data) ?? [];

  const groups: GroupListItem[] = isSearching ? flatSearchGroups : flatGroups;

  const baseUrl = cursorData?.pages?.[0]?.baseUrl ?? "";
  const searchBaseUrl = searchData?.pages?.[0]?.baseUrl ?? "";
  const imageBaseUrl = isSearching ? searchBaseUrl : baseUrl;

  const hasNextPage = isSearching ? hasNextSearch : hasNextCursor;
  const isFetchingNextPage = isSearching
    ? isFetchingNextSearch
    : isFetchingNextCursor;
  const fetchNextPage = isSearching ? fetchNextSearch : fetchNextCursor;

  const error = isSearching ? searchError : cursorError;
  const refetch = isSearching ? refetchSearch : refetchCursor;
  const isFetching = isSearching ? isSearchFetching : isCursorFetching;
  const isLoading = isSearching ? isSearchLoading : isCursorLoading;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن مجموعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right pr-10"
            dir="rtl"
          />
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة مجموعة</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && groups.length === 0 ? (
          <div className="col-span-full">
            <CategoryGroupsSkeleton count={8} showHeader={false} />
          </div>
        ) : error && groups.length === 0 ? (
          <div className="col-span-full">
            <ErrorPage
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        ) : groups.length === 0 ? (
          <div className="col-span-full">
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
                      onClick: () => setIsAddDialogOpen(true),
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          <>
            {groups.map((group) => (
              <Link key={group.id} to={`/category-group/${group.id}`}>
                <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                  <CardHeader className="pb-4">
                    <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                      {group.image ? (
                        <img
                          src={`${imageBaseUrl}/${group.image}`}
                          alt={group.name}
                          className="h-full w-full object-contain transition-transform group-hover:scale-110"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                              group.name,
                            )}`;
                            target.onerror = null;
                          }}
                        />
                      ) : (
                        <Folder className="size-18 text-white bg-cyan/40 rounded-full p-4" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                      {group.name}
                    </CardTitle>
                    <p className="text-md text-muted-foreground line-clamp-3 text-right">
                      {group.description || "—"}
                    </p>
                    <div className="mb-2 flex items-center gap-2">
                      {group.enabled ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 gap-1 text-sm"
                        >
                          <CheckCircle2 className="size-3" />
                          مفعّل
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-sm bg-red-600 text-white"
                        >
                          معطّل
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t pt-2">
                    <div>
                      <span className="text-md text-muted-foreground">
                        عدد الفئات: {group._count?.categories ?? 0}
                      </span>
                    </div>
                    <Badge variant="default" className="px-2 py-1">
                      عرض التفاصيل
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            ))}
            <div
              ref={loadMoreRef}
              className="col-span-full flex justify-center py-6"
            >
              {hasNextPage && (
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
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
        )}
      </div>

      <AddGroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};

export default CategorieGroups;
