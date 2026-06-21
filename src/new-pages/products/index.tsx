import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ShoppingCart, X, Loader2 } from "lucide-react";
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

const ProductsPage = () => {
    const navigate = useNavigate();

    // Single hook that orchestrates all logic
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

            {/* Footer / load more */}
            {actions?.products.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        عرض {actions?.products.length} منتج
                        {actions?.hasNextPage ? " — المزيد متاح" : ""}
                    </p>
                    {actions?.hasNextPage && (
                        <div ref={actions?.loadMoreRef}>
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => actions?.fetchNextPage()}
                                disabled={actions?.isFetchingNextPage}
                            >
                                {actions?.isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        جاري التحميل...
                                    </>
                                ) : (
                                    "تحميل المزيد"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ProductFilterDialog
                open={actions?.isFilterDialogOpen}
                onOpenChange={actions?.setIsFilterDialogOpen}
                values={actions?.filters}
                onApply={actions?.setFilters}
                onClear={actions?.handleClearFilters}
            />

            <AlertDialog open={!!actions?.deleteId} onOpenChange={() => actions?.setDeleteId(null)}>
                <AlertDialogContent dir="rtl" className="text-right">
                    <AlertDialogHeader className="text-right">
                        <AlertDialogTitle>تأكيد حذف المنتج</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel disabled={actions?.isDeleting}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                actions?.handleDelete();
                            }}
                            disabled={actions?.isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {actions?.isDeleting ? "جاري الحذف..." : "حذف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProductsPage;