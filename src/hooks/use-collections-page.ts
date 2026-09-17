import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import type { CollectionListItem } from "@/api/wrappers/collection.wrappers";

const CURSOR_LIMIT = 20;

export interface CollectionFilterValues {
  enabled?: boolean;
}

/**
 * The `/collections` list page's state.
 *
 * Thin by design compared to `use-categories-page`: a collection has one
 * filter worth having (shown or hidden), because it has no groups to belong to
 * and no discounts attached. Adding the rest of the category filter set would
 * be four controls that always return the whole list.
 *
 * The data itself comes through `useDashboardPage` → `useTableData`, which
 * reads the endpoint off the `/collections` entry in `utils/pages` — that
 * registry entry is what makes the query run at all.
 */
export function useCollectionsPage() {
  const actions = useDashboardPage<CollectionListItem, CollectionFilterValues>({
    limit: CURSOR_LIMIT,
    initialFilters: { enabled: undefined },
    enableViewMode: true,
    /*
     * Deletion is `CollectionDeleteModal`'s, not the engine's.
     *
     * `enableDelete` exists to drive a confirm-and-delete flow this page does
     * not have: the modal offers "hide" as well as "delete", so it owns both
     * mutations and the copy explaining that the products survive either way.
     * Wiring `deleteMutation` here as well would leave a second, unreachable
     * delete path — and `useDeleteManager` calls the hook it is handed from
     * inside a `useCallback`, which is a rules-of-hooks violation waiting for
     * the first caller. `use-categories-page` leaves it off for the same
     * reason.
     */
    enableDelete: false,
  });

  const filterTags = useMemo(() => {
    if (actions.filters.enabled === undefined) return [];
    return [
      {
        id: "enabled",
        label: actions.filters.enabled ? "ظاهرة" : "مخفية",
        onRemove: () => actions.setFilters({ ...actions.filters, enabled: undefined }),
      },
    ];
  }, [actions.filters, actions.setFilters]);

  const activeFilterCount = actions.filters.enabled !== undefined ? 1 : 0;

  const collections = actions.data || [];

  const totalProducts = useMemo(
    () =>
      collections.reduce(
        (sum, collection) => sum + (collection._count?.products ?? 0),
        0,
      ),
    [collections],
  );

  return {
    ...actions,
    filterTags,
    activeFilterCount,
    collections,
    totalProducts,
    visibleCount: collections.filter((collection) => collection.enabled).length,
  };
}

export default useCollectionsPage;
