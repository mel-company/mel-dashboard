import { useEffect, useMemo, useState } from "react";
import type { SortOrder } from "@/components/table/pagination";

type Comparable = string | number;

type Options<T> = {
  items: T[];
  /** Field the «مرتبة بشكل» select orders on. Omit to hide that select. */
  getSortValue?: (item: T) => number;
  /**
   * Per-column accessors. A column listed here gets a ⇅ header; anything not
   * listed renders as a plain label, so the affordance never lies.
   */
  columns?: Record<string, (item: unknown) => Comparable | null | undefined>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  defaultViewCount?: number;
};

/**
 * Page state, date ordering and the cursor top-up that every table's footer
 * needs. Each table had its own copy of this, and only notifications had the
 * sort control Figma draws on all of them.
 */
export function useTablePagination<T>({
  items,
  getSortValue,
  columns,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  defaultViewCount = 10,
}: Options<T>) {
  const [requestedPage, setRequestedPage] = useState(1);
  const [viewCount, setViewCount] = useState(defaultViewCount);
  const [sortOrder, setSortOrderState] = useState<SortOrder>("desc");
  const [sortKey, setSortKey] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const accessor = sortKey ? columns?.[sortKey] : undefined;
    if (!accessor && !getSortValue) return items;

    const dir = sortOrder === "desc" ? -1 : 1;
    return [...items].sort((a, b) => {
      if (accessor) {
        const av = accessor(a);
        const bv = accessor(b);
        // Empty cells sort last in either direction.
        if (av == null || av === "") return 1;
        if (bv == null || bv === "") return -1;
        if (typeof av === "number" && typeof bv === "number") {
          return (av - bv) * dir;
        }
        return String(av).localeCompare(String(bv), "ar") * dir;
      }
      return (getSortValue!(a) - getSortValue!(b)) * dir;
    });
  }, [items, columns, sortKey, getSortValue, sortOrder]);

  const totalPages = Math.ceil(sorted.length / viewCount) || 1;
  // Clamp during render rather than correcting it in an effect, so the list
  // never paints one frame of an out-of-range page.
  const activePage = Math.min(requestedPage, totalPages);
  const startIndex = (activePage - 1) * viewCount;
  const pageItems = useMemo(
    () => sorted.slice(startIndex, startIndex + viewCount),
    [sorted, startIndex, viewCount],
  );

  // Pull the next cursor page in when the reader walks past what we hold.
  const needsMoreData = activePage * viewCount > items.length && !!hasNextPage;
  useEffect(() => {
    if (needsMoreData && !isFetchingNextPage) fetchNextPage?.();
  }, [needsMoreData, isFetchingNextPage, fetchNextPage]);

  // Re-ordering the whole list makes the current page meaningless, so both
  // it and a page-size change send the reader back to the first page.
  const setSortOrder = (order: SortOrder) => {
    setSortOrderState(order);
    setRequestedPage(1);
  };

  /** Clicking the active column flips direction; a new column starts ascending. */
  const toggleSortKey = (key: string) => {
    if (sortKey === key) {
      setSortOrderState(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrderState("asc");
    }
    setRequestedPage(1);
  };

  const sort = { key: sortKey, order: sortOrder, toggle: toggleSortKey };

  return {
    activePage,
    viewCount,
    sortOrder,
    setSortOrder,
    totalPages,
    startIndex,
    pageItems,
    /** Pass to each <SortableHead /> in the table's header row. */
    sort,
    /** Spread straight into <Pagination />. */
    paginationProps: {
      totalPages: hasNextPage
        ? Math.max(totalPages, activePage + 1)
        : totalPages,
      activePage,
      viewCount,
      onPageChange: setRequestedPage,
      onViewCountChange: (count: number) => {
        setViewCount(count);
        setRequestedPage(1);
      },
      ...(getSortValue
        ? { sortOrder, onSortOrderChange: setSortOrder }
        : {}),
    },
  };
}

/** `createdAt`/`created_at` as a timestamp, 0 when absent. */
export const byCreatedAt = <T,>(item: T): number => {
  const raw = (item as { createdAt?: string; created_at?: string })?.createdAt
    ?? (item as { created_at?: string })?.created_at;
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(t) ? 0 : t;
};

/** Reads a nested path off a row, e.g. get(o, "customer", "name"). */
export function get(row: unknown, ...path: string[]): unknown {
  let cur: unknown = row;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/** First non-empty value at any of the given top-level keys, as text. */
export function text(row: unknown, ...keys: string[]): string {
  const r = (row ?? {}) as Record<string, unknown>;
  for (const key of keys) {
    const v = r[key];
    if (v != null && v !== "") return String(v);
  }
  return "";
}

/** First numeric value at any of the given top-level keys. */
export function num(row: unknown, ...keys: string[]): number {
  const r = (row ?? {}) as Record<string, unknown>;
  for (const key of keys) {
    const n = Number(r[key]);
    if (Number.isFinite(n) && r[key] != null) return n;
  }
  return 0;
}

/** A date at any of the given keys, as a timestamp. */
export function time(row: unknown, ...keys: string[]): number {
  const r = (row ?? {}) as Record<string, unknown>;
  for (const key of keys) {
    const raw = r[key];
    if (typeof raw === "string" || typeof raw === "number") {
      const t = new Date(raw).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return 0;
}
