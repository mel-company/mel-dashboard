import type { ReactNode } from "react";
import { ShoppingCart, X, Plus } from "lucide-react";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import ProductsSkeleton from "@/pages/product/ProductsSkeleton";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import ProductTable from "./ProductTable";
import ProductCards from "./ProductCards";

interface ProductsContentProps {
  toolbar?: ReactNode;
  actions: any;
  navigate: (path: string) => void;
}

const ProductsContent = ({ actions, toolbar }: ProductsContentProps) => {
  if (actions.isLoading && actions.products.length === 0) {
    return (
      <ProductsSkeleton
        count={8}
        showHeader={false}
        viewMode={actions.viewMode}
      />
    );
  }

  if (actions.error && actions.products.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (actions.products.length === 0) {
    return <EmptyCard actions={actions} />;
  }

  const cards = (
    <ProductCards
      products={actions.products}
      imageBaseUrl={actions.imageBaseUrl}
      onDelete={actions.setDeleteId}
    />
  );

  return (
    <>
      {/* Mobile always uses card list */}
      <div className="xl:hidden">{cards}</div>

      {/* Desktop respects table/cards toggle */}
      <div className="hidden xl:block">
        {actions.viewMode === "table" ? (
          <ProductTable
            toolbar={toolbar}
            products={actions.products}
            onDelete={actions.setDeleteId}
            imageBaseUrl={actions.imageBaseUrl}
          />
        ) : (
          /*
           * One card holding the toolbar and the grid, the same shell the
           * table view uses. Figma (606:15593) runs a single `#0a0e27` card
           * from the toolbar down past the last row — sampled across the grid
           * it is #0a0e27 edge to edge, with the product cards picked out by
           * their border rather than by their fill. Splitting the toolbar off
           * left the grid sitting on the section wrapper, so the cards read as
           * dark blocks on a lighter panel: the inverse of the design.
           */
          <div className="w-full space-y-4 overflow-hidden rounded-[24px] border border-transparent bg-white p-4 shadow-[0_2px_12px_rgba(17,44,113,0.05)] sm:p-6 dark:border-white/[0.06] dark:bg-[#0a0e27] dark:shadow-none">
            {/* The view toggle lives in this toolbar, and the toolbar lives
                inside the table card — so rendering it only in table mode
                removed the only way back. `viewMode` is persisted, so that
                left the page stuck in cards for good. */}
            {toolbar}
            {cards}
          </div>
        )}
      </div>
    </>
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
};
