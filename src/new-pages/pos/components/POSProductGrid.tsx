import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "../utils";
import POSProductCard from "./POSProductCard";

type POSProductGridProps = {
  products: Product[];
  baseUrl: string;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onProductAdd: (product: Product) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
};

const POSProductGrid = ({
  products,
  baseUrl,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onProductAdd,
  scrollRef,
  loadMoreRef,
}: POSProductGridProps) => {
  return (
    <div
      ref={scrollRef}
      className="custom-scrollbar min-h-0 flex-1 overflow-y-auto"
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-[18px] border border-slate-100 p-3 dark:border-slate-800"
            >
              <Skeleton className="h-[140px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
          <Package className="mb-4 size-14 text-slate-300" />
          <p className="font-medium text-slate-600">لا توجد منتجات متاحة</p>
          <p className="mt-1 text-sm text-muted-foreground">
            جرّب فئة أخرى أو غيّر كلمة البحث
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {products.map((product) => (
              <POSProductCard
                key={product.id}
                product={product}
                baseUrl={baseUrl}
                onAdd={onProductAdd}
              />
            ))}
          </div>

          {hasNextPage ? (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  "تحميل المزيد"
                )}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default POSProductGrid;
