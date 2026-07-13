import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { useDeleteProduct, useFetchProductStats } from "@/api/wrappers/product.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import type { ProductListItem } from "@/api/types/product";
import type { ProductFilterValues } from "@/pages/product/ProductFilterDialog";

const CURSOR_LIMIT = 10;

// Helper function to normalize categories data
function normalizeCategoriesData(categoriesData: any): Array<{ id: string; name: string }> {
  if (!categoriesData) return [];

  if (Array.isArray(categoriesData.data)) {
    return categoriesData.data;
  }

  if (Array.isArray(categoriesData)) {
    return categoriesData;
  }

  return [];
}

// Helper function to build filter tags
function buildFilterTags(filters: ProductFilterValues, categoryMap: Map<string, string>, setFilters: (filters: ProductFilterValues) => void) {
  const tags = [];

  // Category filter tags
  filters.categoryIds.forEach((id) => {
    tags.push({
      id,
      label: categoryMap.get(id) ?? "فئة",
      onRemove: () => {
        const newCategoryIds = filters.categoryIds.filter((c: string) => c !== id);
        setFilters({ ...filters, categoryIds: newCategoryIds });
      },
    });
  });

  // Enabled filter tag
  if (filters.enabled !== undefined) {
    tags.push({
      id: "enabled",
      label: filters.enabled ? "مفعل" : "مخفي",
      onRemove: () => setFilters({ ...filters, enabled: undefined }),
    });
  }

  return tags;
}

// Helper function to calculate active filter count
function getActiveFilterCount(filters: ProductFilterValues): number {
  return filters.categoryIds.length + (filters.enabled !== undefined ? 1 : 0);
}

export function useProductsPage() {
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

  const { data: categoriesData } = useFetchCategories(undefined, true);

  // Memoize category map for performance
  const categoryMap = useMemo(() => {
    const normalizedCategories = normalizeCategoriesData(categoriesData);
    return new Map(
      normalizedCategories.map((c: { id: string; name: string }) => [c.id, c.name])
    );
  }, [categoriesData]);

  // Build filter tags
  // Memoize filter tags
  const filterTags = useMemo(() => {
    return buildFilterTags(actions.filters, categoryMap, actions.setFilters);
  }, [actions.filters, categoryMap, actions.setFilters]);

  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(actions.filters);
  }, [actions.filters]);

  const newProductsCount = actions.stats?.newProducts ?? 0;

  const imageBaseUrl =
    actions.imageBaseUrl || categoriesData?.baseUrl || "";

  return {
    ...actions,
    filterTags,
    activeFilterCount,
    newProductsCount,
    products: actions?.data || [],
    imageBaseUrl,
  };
}
