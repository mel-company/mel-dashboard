import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import type { CategoryFilterValues } from "@/pages/category/CategoryFilterDialog";

const CURSOR_LIMIT = 20;

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
function buildFilterTags(filters: CategoryFilterValues, groupMap: Map<string, string>, setFilters: (filters: CategoryFilterValues) => void) {
  const tags = [];

  // Group filter tags
  filters.groupIds.forEach((id) => {
    tags.push({
      id,
      label: groupMap.get(id) ?? "مجموعة",
      onRemove: () => {
        const newGroupIds = filters.groupIds.filter((g: string) => g !== id);
        setFilters({ ...filters, groupIds: newGroupIds });
      },
    });
  });

  // Has discount filter tag
  if (filters.hasDiscount !== undefined) {
    tags.push({
      id: "hasDiscount",
      label: filters.hasDiscount ? "يوجد خصم" : "لا يوجد خصم",
      onRemove: () => setFilters({ ...filters, hasDiscount: undefined }),
    });
  }

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
function getActiveFilterCount(filters: CategoryFilterValues): number {
  return filters.groupIds.length + (filters.hasDiscount !== undefined ? 1 : 0) + (filters.enabled !== undefined ? 1 : 0);
}

export function useCategoriesPage() {
  const actions = useDashboardPage<any, CategoryFilterValues>({
    limit: CURSOR_LIMIT,
    initialFilters: {
      groupIds: [],
      hasDiscount: undefined,
      enabled: undefined,
    },
    enableViewMode: true,
    enableDelete: false,
  });

  const { data: categoriesData } = useFetchCategories(
    undefined,
    actions.hasActiveFilters || actions.isFilterDialogOpen,
  );

  // Memoize category map for performance
  const categoryMap = useMemo(() => {
    const normalizedCategories = normalizeCategoriesData(categoriesData);
    return new Map(
      normalizedCategories.map((c: { id: string; name: string }) => [c.id, c.name])
    );
  }, [categoriesData]);

  // Build filter tags
  const filterTags = useMemo(() => {
    return buildFilterTags(actions.filters, categoryMap, actions.setFilters);
  }, [actions.filters, categoryMap, actions.setFilters]);

  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(actions.filters);
  }, [actions.filters]);

  // Extract image base URL from categories data
  const imageBaseUrl = categoriesData?.pages?.[0]?.baseUrl ?? "";

  return {
    ...actions,
    filterTags,
    activeFilterCount,
    categories: actions?.data || [],
    imageBaseUrl,
  };
}
