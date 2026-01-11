import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Plus, Folder, CheckCircle2, X } from "lucide-react";
import AddCategoryDialog from "@/components/dialogs/AddCategoryDialog";
import {
  useFetchCategories,
  useSearchCategories,
} from "@/api/wrappers/category.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import CategoriesSkeleton from "./CategoriesSkeleton";

type CategoryListItem = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  image: string;
  _count?: { products: number };
};

type CategoryListResponse =
  | CategoryListItem[]
  | { data: CategoryListItem[]; total?: number; page?: number; limit?: number };

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const searchPageParam = searchParams.get("s");
  const currentSearchPage = searchPageParam ? parseInt(searchPageParam) : 1;
  const limit = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedQuery.length > 0;

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ s: "1" });
    } else {
      setSearchParams({ page: "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
    isFetching: isListFetching,
  } = useFetchCategories(
    {
      page: currentPage,
      limit,
    },
    !isSearching
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchCategories({
    query: debouncedQuery,
    page: currentSearchPage,
    limit,
  });

  const activeData = (isSearching ? searchData : listData) as
    | CategoryListResponse
    | undefined;

  const categories: CategoryListItem[] = !activeData
    ? []
    : Array.isArray(activeData)
    ? activeData
    : activeData.data ?? [];

  const error = isSearching ? searchError : listError;
  const refetch = isSearching ? refetchSearch : refetchList;
  const isFetching = isSearching ? isSearchFetching : isListFetching;
  const isLoading = isSearching ? isSearchLoading : isListLoading;

  const totalPages = Math.ceil(
    (listData?.total ?? searchData?.total ?? 0) / limit
  );

  // Get the actual current page based on search state
  const actualCurrentPage = isSearching ? currentSearchPage : currentPage;

  const handlePageChange = (page: number) => {
    // Ensure page is within valid bounds
    const safePage = Math.max(1, Math.min(page, totalPages || 1));
    if (isSearching) {
      setSearchParams({ s: safePage.toString() });
    } else {
      setSearchParams({ page: safePage.toString() });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Category Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right pr-10 pl-10"
            dir="rtl"
          />
          {searchQuery ? (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchQuery("")}
              aria-label="مسح البحث"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة فئة</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {totalPages > 1 && categories.length > 0 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(actualCurrentPage - 1);
                }}
                aria-disabled={actualCurrentPage <= 1}
                className={
                  actualCurrentPage <= 1
                    ? "pointer-events-none opacity-50 bg-black hover:bg-black text-white dark:text-black dark:bg-white dark:hover:bg-white"
                    : "bg-black hover:bg-black/90 text-white dark:text-black dark:bg-white dark:hover:bg-white/80"
                }
              />
            </PaginationItem>

            <PaginationItem className="mx-4 flex items-center gap-2">
              <span>{actualCurrentPage}</span>
              <span>من</span>
              <span>{totalPages}</span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(actualCurrentPage + 1);
                }}
                aria-disabled={actualCurrentPage >= totalPages}
                className={
                  actualCurrentPage >= totalPages
                    ? "pointer-events-none opacity-50 bg-black hover:bg-black text-white dark:text-black dark:bg-white dark:hover:bg-white"
                    : "bg-black hover:bg-black/90 text-white dark:text-black dark:bg-white dark:hover:bg-white/80"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && !activeData ? (
          <div className="col-span-full">
            <CategoriesSkeleton count={8} showHeader={false} />
          </div>
        ) : error && !activeData ? (
          <div className="col-span-full">
            <ErrorPage
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full">
            <EmptyPage
              title={searchQuery.trim() ? "لا توجد نتائج" : "لا توجد فئات"}
              description={
                searchQuery.trim()
                  ? "لم يتم العثور على فئات تطابق البحث. جرّب كلمات أخرى."
                  : "ابدأ بإضافة فئة جديدة لعرضها هنا."
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
                      label: "إضافة فئة",
                      onClick: () => setIsDialogOpen(true),
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          categories.map((category) => (
            <Link key={category.id} to={`/categories/${category.id}`}>
              <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                <CardHeader className="pb-4">
                  <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                    <img
                      src={`${listData?.baseUrl}/${category.image}`}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.currentTarget;
                        target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                          category.name
                        )}`;
                        target.onerror = null; // Prevent infinite loop
                      }}
                    />
                    {/* <Folder className="size-18 text-white bg-cyan/40 rounded-full p-4" /> */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                    {category.name}
                  </CardTitle>
                  <p className="text-md text-muted-foreground line-clamp-3 text-right">
                    {category.description}
                  </p>
                  <div className="mb-2 flex items-center gap-2">
                    {category.enabled ? (
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
                      عدد المنتجات: {category._count?.products ?? 0}
                    </span>
                  </div>
                  <Badge variant="default" className="px-2 py-1">
                    عرض التفاصيل
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Add Category Dialog */}
      <AddCategoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};

export default Categories;
