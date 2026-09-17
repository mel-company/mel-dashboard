import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Layers01Icon } from "@hugeicons-pro/core-bulk-rounded";
import { Package02Icon, ViewIcon } from "@hugeicons-pro/core-bulk-rounded";

import { Button } from "@/components/ui/button";
import { BaseCard } from "@/components/table/top-cards";
import PageTableHeader from "@/components/table/header";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";
import { cn } from "@/lib/utils";
import { useCollectionsPage } from "@/hooks/use-collections-page";
import AddCollectionDialog from "@/components/dialogs/AddCollectionDialog";
import CollectionFilterDialog from "@/pages/collection/CollectionFilterDialog";
import CollectionsContent from "./components/CollectionsContent";

/**
 * `/collections` — the merchant's curated sets.
 *
 * Laid out like `/categories` because they sit beside each other in the
 * sidebar and are the same kind of object to manage, minus the Groups tab
 * (collections have no grouping of their own) and the image column.
 */
const CollectionsPage = () => {
  const actions = useCollectionsPage();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="hidden lg:block">
        <TitleBar listLabel="المجموعات">
          <Button
            className="h-11 w-full shrink-0 gap-2 rounded-full bg-violet-100 px-4 text-violet-700 shadow-sm hover:bg-violet-200 sm:w-auto sm:gap-2.5 sm:px-5 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20"
            onClick={() => setIsAddOpen(true)}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            <span className="truncate">إضافة مجموعة</span>
          </Button>
        </TitleBar>
      </div>

      <div className="lg:hidden">
        <Button
          className="h-12 w-full gap-2 rounded-full bg-violet-100 text-violet-700 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          onClick={() => setIsAddOpen(true)}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
          إضافة مجموعة
        </Button>
      </div>

      <div className="mb-6 rounded-[28px] bg-slate-50 p-5 dark:bg-transparent md:bg-transparent md:p-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          <BaseCard
            icon={Layers01Icon}
            title="إجمالي المجموعات"
            value={String(actions.collections.length)}
            color="accent"
          />
          <BaseCard
            icon={ViewIcon}
            title="ظاهرة في المتجر"
            value={String(actions.visibleCount)}
            color="default"
          />
          <BaseCard
            icon={Package02Icon}
            title="منتجات داخل المجموعات"
            value={String(actions.totalProducts)}
            color="default"
          />
        </div>
      </div>

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
                value={actions.searchQuery ?? ""}
                onChange={(e) => actions.onSearchChange?.(e.target.value)}
                placeholder="مجموعة"
                className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
              />
              <Search
                className="size-5 shrink-0 text-slate-400 dark:text-[#4a5596]"
                strokeWidth={2.25}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => actions.setIsFilterDialogOpen(true)}
            aria-label="الفلاتر"
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center rounded-[14px] border",
              "border-slate-200 bg-sky-50 text-sky-600",
              "dark:border-[#00b7ff]/15 dark:bg-transparent dark:text-[#33c5ff]",
            )}
          >
            <FilterSlidersIcon size={20} />
            {actions.hasActiveFilters && actions.activeFilterCount > 0 ? (
              <span className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                +{actions.activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <PageTableHeader
          {...actions}
          title="جميع المجموعات"
          subtitle={`أجمالي المجموعات ${actions.collections.length}`}
          searchPlaceholder="ابحث عن مجموعة"
          onFilterClick={() => actions.setIsFilterDialogOpen(true)}
        >
          <SwitchTab
            selected={actions.viewMode}
            onChange={(value) =>
              actions.handleViewModeChange(value as "table" | "cards")
            }
          />
        </PageTableHeader>
      </div>

      <CollectionsContent
        actions={{ ...actions, setIsAddDialogOpen: setIsAddOpen }}
      />

      <AddCollectionDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={actions.refetch}
      />
      <CollectionFilterDialog
        open={actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.filters}
        onApply={actions.setFilters}
        onClear={actions.handleClearFilters}
      />
    </div>
  );
};

export default CollectionsPage;
