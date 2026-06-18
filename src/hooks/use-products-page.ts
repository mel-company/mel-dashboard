import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { useDeleteProduct, useFetchProductStats } from "@/api/wrappers/product.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import type { ProductListItem } from "@/api/types/product";
import type { ProductFilterValues } from "@/pages/product/ProductFilterDialog";

const CURSOR_LIMIT = 10;

export function useProductsPage() {
  // Use the flexible dashboard page hook
  const actions = useDashboardPage<ProductListItem, ProductFilterValues>({
    limit: CURSOR_LIMIT,
    initialFilters: {
      categoryIds: [],
      enabled: undefined,
    },
    enableViewMode: true,
    enableDelete: true,
    deleteMutation: useDeleteProduct,
    statsHook: useFetchProductStats,
  });

  // Fetch categories for filter tags
  const { data: categoriesData } = useFetchCategories(
    undefined,
    actions.hasActiveFilters || actions.isFilterDialogOpen,
  );

  const categoryMap = new Map<string, string>(
    (Array.isArray(categoriesData?.data)
      ? categoriesData.data
      : Array.isArray(categoriesData)
        ? categoriesData
        : []
    ).map((c: { id: string; name: string }) => [c.id, c.name]),
  );

  // Build filter tags
  const filterTags = [
    ...actions.filters.categoryIds.map((id) => ({
      id,
      label: categoryMap.get(id) ?? "فئة",
      onRemove: () =>
        actions.setFilters({
          ...actions.filters,
          categoryIds: actions.filters.categoryIds.filter((c: string) => c !== id),
        }),
    })),
    ...(actions.filters.enabled !== undefined
      ? [
        {
          id: "enabled",
          label: actions.filters.enabled ? "مفعل" : "مخفي",
          onRemove: () =>
            actions.setFilters({ ...actions.filters, enabled: undefined }),
        },
      ]
      : []),
  ];

  const activeFilterCount =
    (actions.filters.categoryIds.length || 0) +
    (actions.filters.enabled !== undefined ? 1 : 0);

  const newProductsCount = actions.stats?.newProducts ?? 0;

  return {
    ...actions,
    filterTags,
    activeFilterCount,
    newProductsCount,
    products: actions?.data || [],
  };
}
