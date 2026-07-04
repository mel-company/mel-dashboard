import { useMemo, useState, useCallback, useEffect } from "react";
import { useFilterDiscountsCursor } from "@/api/wrappers/discount.wrappers";
import { useFilterCouponsCursor } from "@/api/wrappers/coupon.wrappers";
import { useInfiniteScroll } from "@/hooks/use-table-data";
import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";
import type { CouponListItem } from "@/api/types/coupon";
import type { DiscountFilterValues } from "@/pages/discount/DiscountFilterDialog";
import type { CouponFilterValues } from "@/pages/coupone/CouponFilterDialog";
import { pages } from "@/utils/pages";

const CURSOR_LIMIT = 12;
const DISCOUNTS_PAGE = pages.find((p) => p.slug === "/discounts");

export type DiscountsTab = "discounts" | "coupons";

function flattenPages<T>(pages: unknown[] | undefined): T[] {
  if (!pages) return [];

  return pages.flatMap((page) => {
    if (Array.isArray(page)) return page as T[];
    if (page && typeof page === "object" && Array.isArray((page as { data?: T[] }).data)) {
      return (page as { data: T[] }).data;
    }
    return [];
  });
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

export function useDiscountsPage() {
  const [activeTab, setActiveTab] = useState<DiscountsTab>("discounts");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscountListItem | null>(null);
  const [deleteCouponTarget, setDeleteCouponTarget] = useState<CouponListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountFilters, setDiscountFilters] = useState<DiscountFilterValues>({
    status: undefined,
    startDate: "",
    endDate: "",
  });
  const [couponFilters, setCouponFilters] = useState<CouponFilterValues>({
    isActive: undefined,
    startDate: "",
    expireDate: "",
    maxUsageLimit: undefined,
  });

  const storageKey = `${DISCOUNTS_PAGE?.apiEndpoint ?? "discounts"}ViewMode`;
  const savedViewMode = localStorage.getItem(storageKey);
  const [viewMode, setViewMode] = useState<"table" | "cards">(
    savedViewMode === "cards" ? "cards" : "table",
  );

  const isDiscountsTab = activeTab === "discounts";
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  const discountQuery = useFilterDiscountsCursor(
    {
      query: debouncedSearch || undefined,
      status: discountFilters.status,
      startDate: discountFilters.startDate || undefined,
      endDate: discountFilters.endDate || undefined,
      limit: CURSOR_LIMIT,
    },
    isDiscountsTab,
  );

  const couponQuery = useFilterCouponsCursor(
    {
      query: debouncedSearch || undefined,
      isActive: couponFilters.isActive,
      startDate: couponFilters.startDate || undefined,
      expireDate: couponFilters.expireDate || undefined,
      maxUsageLimit: couponFilters.maxUsageLimit,
      limit: CURSOR_LIMIT,
    },
    !isDiscountsTab,
  );

  const discounts = useMemo(
    () => flattenPages<DiscountListItem>(discountQuery.data?.pages),
    [discountQuery.data?.pages],
  );

  const coupons = useMemo(
    () => flattenPages<CouponListItem>(couponQuery.data?.pages),
    [couponQuery.data?.pages],
  );

  const discountHasActiveFilters = Boolean(
    discountFilters.status || discountFilters.startDate || discountFilters.endDate,
  );

  const couponHasActiveFilters = Boolean(
    couponFilters.isActive !== undefined ||
      couponFilters.startDate ||
      couponFilters.expireDate ||
      couponFilters.maxUsageLimit !== undefined,
  );

  const discountActiveFilterCount = [
    discountFilters.status,
    discountFilters.startDate,
    discountFilters.endDate,
  ].filter(Boolean).length;

  const couponActiveFilterCount = [
    couponFilters.isActive !== undefined ? "x" : null,
    couponFilters.startDate,
    couponFilters.expireDate,
    couponFilters.maxUsageLimit !== undefined ? "x" : null,
  ].filter(Boolean).length;

  const discountStats = useMemo(() => {
    const active = discounts.filter(
      (d) => d.discount_status === DISCOUNT_STATUS.ACTIVE,
    ).length;
    const highest = discounts.reduce(
      (max, d) => Math.max(max, d.discount_percentage ?? 0),
      0,
    );
    const totalUsage = discounts.reduce(
      (sum, d) =>
        sum +
        (d.usage_count ??
          d._count?.redemptions ??
          d._count?.orders ??
          0),
      0,
    );

    return {
      totalUsageAmount: totalUsage,
      activeDiscounts: active,
      highestDiscount: highest,
    };
  }, [discounts]);

  const couponStats = useMemo(() => {
    const activeCoupons = coupons.filter(
      (c) => c.isActive && new Date(c.expiresAt ?? 0) >= new Date(),
    );
    const active = activeCoupons.length;
    const totalUsed = coupons.reduce(
      (sum, c) => sum + (c.usedCount ?? c._count?.redemptions ?? 0),
      0,
    );
    const activeUsage = activeCoupons.reduce(
      (sum, c) => sum + (c.usedCount ?? c._count?.redemptions ?? 0),
      0,
    );
    const highest = coupons.reduce((max, c) => Math.max(max, c.value ?? 0), 0);

    return {
      totalDiscountedAmount: totalUsed,
      activeCoupons: active,
      activeCouponsUsage: activeUsage,
      highestDiscount: highest,
    };
  }, [coupons]);

  const handleClearDiscountFilters = useCallback(() => {
    setDiscountFilters({ status: undefined, startDate: "", endDate: "" });
  }, []);

  const handleClearCouponFilters = useCallback(() => {
    setCouponFilters({
      isActive: undefined,
      startDate: "",
      expireDate: "",
      maxUsageLimit: undefined,
    });
  }, []);

  const handleViewModeChange = useCallback((mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem(storageKey, mode);
  }, [storageKey]);

  const activeQuery = isDiscountsTab ? discountQuery : couponQuery;

  const loadMoreRef = useInfiniteScroll({
    hasNextPage: !!activeQuery.hasNextPage,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
  });

  return {
    activeTab,
    setActiveTab,
    discounts,
    coupons,
    discountStats,
    couponStats,
    stats: isDiscountsTab ? discountStats : couponStats,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    deleteTarget,
    setDeleteTarget,
    deleteCouponTarget,
    setDeleteCouponTarget,
    couponFilters,
    setCouponFilters,
    handleClearCouponFilters,
    discountRefetch: discountQuery.refetch,
    couponRefetch: couponQuery.refetch,
    searchQuery,
    onSearchChange: setSearchQuery,
    discountFilters,
    setDiscountFilters,
    handleClearDiscountFilters,
    viewMode,
    handleViewModeChange,
    hasActiveFilters: isDiscountsTab ? discountHasActiveFilters : couponHasActiveFilters,
    activeFilterCount: isDiscountsTab ? discountActiveFilterCount : couponActiveFilterCount,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isLoading: activeQuery.isLoading,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    hasNextPage: !!activeQuery.hasNextPage,
    error: activeQuery.error as Error | null,
    refetch: activeQuery.refetch,
    fetchNextPage: activeQuery.fetchNextPage,
    loadMoreRef,
  };
}
