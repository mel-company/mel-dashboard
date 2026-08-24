import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import ProductFilterDialog from "@/pages/product/ProductFilterDialog";
import ProductStatsCards from "@/pages/product/ProductStatsCards";
import ProductsContent from "./components/ProductsContent";
import PageTableHeader from "@/components/table/header";
import { useProductsPage } from "@/hooks/use-products-page";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import ProductDeleteModal from "./components/delete-modal";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";
import { cn } from "@/lib/utils";

const ProductsPage = () => {
  const navigate = useNavigate();

  const actions = useProductsPage();
  const activeSearch = actions.searchQuery?.trim() ?? "";
  const listTitle = activeSearch ? "نتائج البحث" : "جميع المنتجات";
  const listCount =
    actions.stats?.totalProducts ?? actions.products?.length ?? 0;
  const listSubtitle = activeSearch
    ? `قمت بالبحث عن : "${activeSearch}"`
    : `أجمالي العناصر المتاحة ${listCount.toLocaleString("ar-IQ")}`;

  return (
    <div
      className="min-h-full space-y-4 rounded-[28px] bg-surface p-3 sm:space-y-6 sm:p-4 lg:p-5"
      dir="rtl"
    >
      <div className="hidden md:block">
        <TitleBar count={actions.newProductsCount} listLabel="المنتجات">
          <Button
            className="h-12 shrink-0 gap-2 rounded-[14px] bg-violet-100 px-4 text-violet-700 shadow-sm hover:bg-violet-200 sm:gap-2.5 sm:px-5 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20"
            onClick={() => navigate("/products/add")}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
            أضافة منتج
          </Button>
        </TitleBar>
      </div>

      <div className="space-y-3 md:hidden">
        <Button
          className="h-12 w-full gap-2 rounded-[14px] bg-violet-100 text-violet-700 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          onClick={() => navigate("/products/add")}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
            <Plus className="size-3.5" strokeWidth={2.5} />
          </span>
          أضافة منتج
        </Button>
      </div>

      <div className="rounded-[28px] bg-slate-50 p-4 dark:bg-transparent md:bg-transparent md:p-0">
        <ProductStatsCards />
      </div>

      <div className="space-y-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-[14px] border px-2",
              "border-[#00b7ff]/15 bg-white",
              "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27]",
            )}
          >
            <span className="flex h-8 shrink-0 items-center rounded-lg bg-[#00b7ff]/5 px-4 text-sm text-[#00b7ff]">
              البحث
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
              <input
                type="search"
                value={actions.searchQuery ?? ""}
                onChange={(e) => actions.onSearchChange?.(e.target.value)}
                placeholder="ابحث عن المنتجات"
                className="min-w-0 flex-1 bg-transparent text-right text-sm text-slate-800 outline-none placeholder:text-[#91a0b6] dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
              />
              <Search
                className="size-5 shrink-0 text-[#91a0b6] dark:text-[#4a5596]"
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
              "border-[#00b7ff]/15 bg-white text-[#00b7ff]",
              "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27] dark:text-[#33c5ff]",
            )}
          >
            <FilterSlidersIcon size={20} />
            {actions.hasActiveFilters && actions.activeFilterCount > 0 ? (
              <span className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ff0808] px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_12px_rgba(255,8,8,0.2)]">
                +{actions.activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="text-right">
          <h2 className="text-lg font-bold text-[#3b4656] dark:text-slate-50">
            {listTitle}
          </h2>
          <p className="mt-0.5 text-xs text-[#6c809d]">{listSubtitle}</p>
        </div>
      </div>

      <div className="hidden md:block">
        <PageTableHeader
          {...actions}
          title={listTitle}
          subtitle={listSubtitle}
          searchPlaceholder="ابحث عن المنتجات"
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

      <ProductsContent actions={actions} navigate={navigate} />

      <ProductFilterDialog
        open={actions.isFilterDialogOpen}
        onOpenChange={actions.setIsFilterDialogOpen}
        values={actions.filters}
        onApply={actions.setFilters}
        onClear={actions.handleClearFilters}
      />
      <ProductDeleteModal {...actions} />
    </div>
  );
};

export default ProductsPage;
