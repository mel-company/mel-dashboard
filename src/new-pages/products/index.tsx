import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus, ShoppingCart, X } from "lucide-react";
import ProductFilterDialog from "@/pages/product/ProductFilterDialog";
import ProductStatsCards from "@/pages/product/ProductStatsCards";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import ProductsSkeleton from "@/pages/product/ProductsSkeleton";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import ProductTable from "./components/ProductTable";
import ProductCards from "./components/ProductCards";
import PageTableHeader from "@/components/table/header";
import { useProductsPage } from "@/hooks/use-products-page";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import ProducDeletetModal from "./components/delete-modal";

const ProductsPage = () => {
    const navigate = useNavigate();

    const actions = useProductsPage();

    return (
        <div className="space-y-6">
            {/* Header */}
            <TitleBar>
                <Button
                    className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
                    onClick={() => navigate("/products/add")}
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
                        <Plus className="size-4" strokeWidth={2.5} />
                    </span>
                    إضافة منتج جديد
                </Button>
            </TitleBar>


            <ProductStatsCards />

            {/* Toolbar */}
            <PageTableHeader
                title="المنتجات"
                searchQuery={actions.search}
                onSearchChange={actions.setSearchValue}
                onFilterClick={() => actions.setIsFilterDialogOpen(true)}
                hasActiveFilters={actions.hasActiveFilters}
                activeFilterCount={actions.activeFilterCount}
            >
                <SwitchTab
                    selected={actions.viewMode}
                    onChange={actions.handleViewModeChange as any}
                />
                .
            </PageTableHeader>

            {/* Content */}
            {actions?.isLoading && actions?.products.length === 0 ? (
                <ProductsSkeleton count={8} showHeader={false} viewMode={actions?.viewMode} />
            ) : actions?.error && actions?.products.length === 0 ? (
                <ErrorPage error={actions?.error} onRetry={() => actions?.refetch()} isRetrying={false} />
            ) : actions?.products.length === 0 ? (
                <EmptyPage
                    title={actions?.search || actions?.hasActiveFilters ? "لا توجد نتائج" : "لا توجد منتجات"}
                    description={
                        actions?.search || actions?.hasActiveFilters
                            ? "لم يتم العثور على منتجات تطابق البحث أو التصفية."
                            : "ابدأ بإضافة منتج جديد لعرضه هنا."
                    }
                    icon={<ShoppingCart className="size-7 text-muted-foreground" />}
                    primaryAction={
                        actions?.search || actions?.hasActiveFilters
                            ? {
                                label: "مسح البحث والتصفية",
                                onClick: () => {
                                    actions?.setSearchValue("");
                                    actions?.handleClearFilters();
                                },
                                icon: <X className="size-4" />,
                                variant: "secondary",
                            }
                            : {
                                label: "إضافة منتج",
                                onClick: () => navigate("/products/add"),
                                icon: <Plus className="size-4" />,
                            }
                    }
                />
            ) : actions?.viewMode === "table" ? (
                <ProductTable products={actions?.products} onDelete={actions?.setDeleteId} />
            ) : (
                <ProductCards products={actions?.products} />
            )}

            <ProductFilterDialog
                open={actions?.isFilterDialogOpen}
                onOpenChange={actions?.setIsFilterDialogOpen}
                values={actions?.filters}
                onApply={actions?.setFilters}
                onClear={actions?.handleClearFilters}
            />
            <ProducDeletetModal {...actions} />

        </div>
    );
};

export default ProductsPage;