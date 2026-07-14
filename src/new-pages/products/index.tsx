import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import ProductFilterDialog from "@/pages/product/ProductFilterDialog";
import ProductStatsCards from "@/pages/product/ProductStatsCards";
import ProductsContent from "./components/ProductsContent";
import PageTableHeader from "@/components/table/header";
import { useProductsPage } from "@/hooks/use-products-page";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import ProductDeleteModal from "./components/delete-modal";

const ProductsPage = () => {
    const navigate = useNavigate();

    const actions = useProductsPage();
    const activeSearch = actions.searchQuery?.trim() ?? "";
    const listTitle = activeSearch ? "نتائج البحث" : "المنتجات";
    const listSubtitle = activeSearch
        ? `قمت بالبحث عن : "${activeSearch}"`
        : undefined;

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
                {...actions}
                title={listTitle}
                subtitle={listSubtitle}
                onFilterClick={() => actions.setIsFilterDialogOpen(true)}
            >
                <SwitchTab
                    selected={actions.viewMode}
                    onChange={(value) => actions.handleViewModeChange(value as "table" | "cards")}
                />
            </PageTableHeader>

            {/* Content */}
            <ProductsContent actions={actions} navigate={navigate} />

            <ProductFilterDialog
                open={actions.isFilterDialogOpen}
                onOpenChange={actions.setIsFilterDialogOpen}
                values={actions.filters}
                onApply={actions.setFilters}
                onClear={actions.handleClearFilters}
            />
            <ProductDeleteModal {...actions} />

        </div >
    );
};

export default ProductsPage;