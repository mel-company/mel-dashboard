import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Plus,
  User,
  MapPin,
  Phone,
  ShoppingBag,
  FileText,
  X,
} from "lucide-react";
import {
  useFetchCustomers,
  useSearchCustomers,
} from "@/api/wrappers/customer.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import CustomersSkeleton from "./CustomersSkeleton";

const Customers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const searchPageParam = searchParams.get("s");
  const currentSearchPage = searchPageParam ? parseInt(searchPageParam) : 1;
  const limit = 10;

  function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const id = setTimeout(() => setDebouncedValue(value), delayMs);
      return () => clearTimeout(id);
    }, [value, delayMs]);

    return debouncedValue;
  }

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
  } = useFetchCustomers(
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
  } = useSearchCustomers(
    {
      query: debouncedQuery,
      page: currentSearchPage,
      limit,
    },
    true
  );

  const activeData = isSearching ? searchData : listData;
  const customers: any[] = !activeData
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

  const hasCustomers = customers.length > 0;

  return (
    <div className="space-y-6">
      {/* Search and Add Customer Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن عميل..."
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
        {/* <Button className="gap-2 w-full sm:w-auto" onClick={() => {}}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة عميل</span>
          <span className="sm:hidden">إضافة</span>
        </Button> */}
      </div>

      {totalPages > 1 && customers.length > 0 ? (
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

      {isLoading && !activeData ? (
        <CustomersSkeleton showHeader={false} rows={6} />
      ) : error && !activeData ? (
        <ErrorPage
          title="خطأ في تحميل العملاء"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : !hasCustomers ? (
        <EmptyPage
          title={isSearching ? "لا توجد نتائج" : "لا يوجد عملاء"}
          description={
            isSearching
              ? "لم يتم العثور على عملاء يطابقون البحث"
              : "ابدأ بإضافة عميل جديد"
          }
          icon={<User className="size-7 text-muted-foreground" />}
          primaryAction={
            !isSearching
              ? {
                  label: "إضافة عميل",
                  onClick: () => {},
                  icon: <Plus className="size-4" />,
                }
              : undefined
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم العميل</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const orderCount = customer._count?.orders ?? 0;
                const user = customer.user;
                const customerId = customer.id;

                return (
                  <TableRow
                    key={customerId}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/customers/${customerId}`)}
                  >
                    <TableCell className="font-medium">
                      #{customerId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-medium">{user?.name ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span className="text-sm">{user?.phone ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <MapPin className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {user?.location ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {orderCount} {orderCount === 1 ? "طلب" : "طلبات"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link to={`/customers/${customerId}`}>
                        <Button variant="secondary" size="sm" className="gap-2">
                          <FileText className="size-4" />
                          التفاصيل
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Customers;
