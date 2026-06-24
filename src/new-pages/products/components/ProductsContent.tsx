import { ShoppingCart, X, Plus } from "lucide-react";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import ProductsSkeleton from "@/pages/product/ProductsSkeleton";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import ProductTable from "./ProductTable";
import ProductCards from "./ProductCards";

interface ProductsContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const ProductsContent = ({ actions }: ProductsContentProps) => {
    if (actions.isLoading && actions.products.length === 0) {
        return <ProductsSkeleton count={8} showHeader={false} viewMode={actions.viewMode} />;
    }

    if (actions.error && actions.products.length === 0) {
        return <ErrorPage error={actions.error} onRetry={() => actions.refetch()} isRetrying={false} />;
    }

    if (actions.products.length === 0) {
        return <EmptyCard actions={actions} />;
    }

    return actions.viewMode === "table" ? (
        <ProductTable products={actions.products} onDelete={actions.setDeleteId} />
    ) : (
        <ProductCards products={actions.products} />
    );
};

export default ProductsContent;

const EmptyCard = ({ actions }: { actions: any }) => {
    const navigate = actions.navigate;
    const hasFilters = actions.search || actions.hasActiveFilters;
    const primaryAction = hasFilters
        ? {
            label: "مسح البحث والتصفية",
            onClick: () => {
                actions.setSearchValue("");
                actions.handleClearFilters();
            },
            icon: <X className="size-4" />,
            variant: "secondary" as const,
        }
        : {
            label: "إضافة منتج",
            onClick: () => navigate("/products/add"),
            icon: <Plus className="size-4" />,
        };

    return (
        <EmptyPage
            title={hasFilters ? "لا توجد نتائج" : "لا توجد منتجات"}
            description={
                hasFilters
                    ? "لم يتم العثور على منتجات تطابق البحث أو التصفية."
                    : "ابدأ بإضافة منتج جديد لعرضه هنا."
            }
            icon={<ShoppingCart className="size-7 text-muted-foreground" />}
            primaryAction={primaryAction}
        />
    );
}
