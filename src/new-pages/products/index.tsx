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
  const listSubtitle = activeSearch
    ? `قمت بالبحث عن : "${activeSearch}"`
    : `إجمالي المنتجات: ${
        actions.stats?.totalProducts?.toLocaleString("ar-IQ") ?? "—"
      }`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop header */}
      <div className="hidden md:block">
        <TitleBar count={actions.newProductsCount}>
          <Button
            className="h-11 shrink-0 gap-2.5 rounded-full bg-violet-100 px-5 text-violet-700 shadow-sm hover:bg-violet-200 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20 dark:border dark:border-[#9a5cff]/15"
            onClick={() => navigate("/products/add")}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/15 dark:bg-violet-400/20">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            إضافة منتج
          </Button>
        </TitleBar>
      </div>

      <ProductStatsCards />

      {/* Mobile toolbar: search + filter first */}
      <div className="space-y-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3",
              "border-slate-200 bg-white",
              "dark:border-white/[0.08] dark:bg-[#0a0e27]",
            )}
          >
            <Search className="size-5 shrink-0 text-sky-500" strokeWidth={2.25} />
            <input
              type="search"
              value={actions.searchQuery ?? ""}
              onChange={(e) => actions.onSearchChange?.(e.target.value)}
              placeholder="البحث عن المنتجات"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={() => actions.setIsFilterDialogOpen(true)}
            aria-label="الفلاتر"
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center rounded-2xl border",
              "border-slate-200 bg-sky-50 text-sky-600",
              "dark:border-white/[0.08] dark:bg-[#33c5ff]/10 dark:text-[#33c5ff]",
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

        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {listTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">{listSubtitle}</p>
        </div>
      </div>

      {/* Desktop toolbar */}
      <div className="hidden md:block">
        <PageTableHeader
          {...actions}
          title={listTitle}
          subtitle={listSubtitle}
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
