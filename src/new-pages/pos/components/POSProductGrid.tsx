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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-950">المنتجات</h2>
        <p className="text-sm text-muted-foreground">
          {products.length > 0 ? `${products.length} منتج` : "لا توجد منتجات"}
        </p>
      </div>

      <div ref={scrollRef} className="custom-scrollbar flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-2xl border p-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <Package className="mb-4 size-16 text-slate-300" />
            <p className="font-medium text-slate-600">لا توجد منتجات متاحة</p>
            <p className="mt-1 text-sm text-muted-foreground">
              جرّب فئة أخرى أو غيّر كلمة البحث
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
    </div>
  );
};

export default POSProductGrid;
