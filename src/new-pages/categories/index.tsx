import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import AddCategoryDialog from "@/components/dialogs/AddCategoryDialog";
import CategoryFilterDialog from "@/pages/category/CategoryFilterDialog";
import { BaseCard } from "@/components/table/top-cards";
import PageTableHeader from "@/components/table/header";
import { useCategoriesPage } from "@/hooks/use-categories-page";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import CategoriesContent from "./components/CategoriesContent";
import GroupsContent from "./components/GroupsContent";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";
import { cn } from "@/lib/utils";
import {
  Layers01Icon,
  ShapeCollectionIcon,
} from "@hugeicons-pro/core-duotone-rounded";
import {
  Fire03Icon,
  GitBranchIcon,
  GitCommitVerticalIcon,
} from "@hugeicons-pro/core-bulk-rounded";
import { formatCount } from "@/utils/format-currency";

const tabOptions = [
  { label: "الفئات", value: "categories", icon: ShapeCollectionIcon },
  { label: "المجموعات", value: "groups", icon: Layers01Icon },
];

const CategoriesPage = () => {
  const actions = useCategoriesPage();
  const [showGroups, setShowGroups] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  const listTitle = showGroups ? "جميع المجموعات" : "جميع الفئات";
  const listCount = formatCount(
    actions.stats?.totalCategories ?? actions.categories.length,
  );
  const listSubtitle = showGroups
    ? undefined
    : `أجمالي العناصر المتاحة ${listCount}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="hidden md:block">
        <TitleBar
          count={showGroups ? undefined : (actions.categories?.length ?? 0)}
          listLabel={showGroups ? "المجموعات" : "الفئات"}
        >
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              className="h-11 w-full shrink-0 gap-2 rounded-full bg-violet-100 px-4 text-violet-700 shadow-sm hover:bg-violet-200 sm:w-auto sm:gap-2.5 sm:px-5 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20"
              onClick={() =>
                showGroups ? setIsAddGroupOpen(true) : setIsAddCategoryOpen(true)
              }
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
                <Plus className="size-4" strokeWidth={2.5} />
              </span>
              <span className="truncate">
                {showGroups ? "إضافة مجموعة" : "إضافة فئة جديدة"}
              </span>
            </Button>
            <SwitchTab
              selected={showGroups ? "groups" : "categories"}
              onChange={(value) => setShowGroups(value === "groups")}
              accent="violet"
              options={tabOptions}
            />
          </div>
        </TitleBar>
      </div>

      <div className="space-y-3 md:hidden">
        <SwitchTab
          selected={showGroups ? "groups" : "categories"}
          onChange={(value) => setShowGroups(value === "groups")}
          accent="violet"
          options={tabOptions}
        />
        <Button
          className="h-12 w-full gap-2 rounded-full bg-violet-100 text-violet-700 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          onClick={() =>
            showGroups ? setIsAddGroupOpen(true) : setIsAddCategoryOpen(true)
          }
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
            <Plus className="size-4" strokeWidth={2.5} />
          </span>
          {showGroups ? "إضافة مجموعة" : "إضافة فئة جديدة"}
        </Button>
      </div>

      {showGroups ? (
        <GroupsContent
          viewMode={actions.viewMode}
          onViewModeChange={actions.handleViewModeChange}
          isAddOpen={isAddGroupOpen}
          onAddOpenChange={setIsAddGroupOpen}
        />
      ) : (
        <>
          <div className="mb-6 rounded-[28px] bg-slate-50 p-5 dark:bg-transparent md:bg-transparent md:p-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              <BaseCard
                icon={Fire03Icon}
                title="الفئات الأعلى طلباً"
                value={actions.stats?.totalCategories?.toString() || String(actions.categories.length)}
                color="danger"
                growth={-12.6}
              />
              <BaseCard
                icon={GitCommitVerticalIcon}
                title="إجمالي الفئات الرئيسية"
                value={actions.stats?.activeCategories?.toString() || "0"}
                color="accent"
              />
              <BaseCard
                icon={GitBranchIcon}
                title="إجمالي الفئات الفرعية"
                value={actions.stats?.totalProducts?.toString() || "0"}
                color="default"
              />
            </div>
          </div>

          <div className="space-y-3 md:hidden">
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
                    placeholder="فئة"
                    className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
                  />
                  <Search className="size-5 shrink-0 text-slate-400 dark:text-[#4a5596]" strokeWidth={2.25} />
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

          <div className="hidden md:block">
            <PageTableHeader
              {...actions}
              title={listTitle}
              subtitle={listSubtitle}
              searchPlaceholder="ابحث عن فئة"
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

          <CategoriesContent
            actions={{ ...actions, setIsAddDialogOpen: setIsAddCategoryOpen }}
          />
        </>
      )}

      <AddCategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
      />
      <CategoryFilterDialog
        open={actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.filters}
        onApply={actions.setFilters}
        onClear={actions.handleClearFilters}
      />
    </div>
  );
};

export default CategoriesPage;
