import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LoadMore from "@/components/table/load-more";
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
};

/**
 * The product tiles. Scrolls inside its column on desktop only: on a phone a
 * second scroll area inside the page trapped the thumb, so there the page
 * itself scrolls. `LoadMore` watches its own sentinel against the viewport,
 * which works for both.
 */
const POSProductGrid = ({
  products,
  baseUrl,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onProductAdd,
}: POSProductGridProps) => {
  const grid =
    "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="custom-scrollbar lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pe-1">
      {isLoading ? (
        <div className={grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 rounded-2xl border border-slate-200 p-2 dark:border-slate-800"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
          <Package className="mb-3 size-10 text-slate-300" />
          <p className="font-medium text-slate-600 dark:text-slate-300">
            لا توجد منتجات
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            جرّب فئة أخرى أو غيّر كلمة البحث
          </p>
        </div>
      ) : (
        <>
          <div className={grid}>
            {products.map((product) => (
              <POSProductCard
                key={product.id}
                product={product}
                baseUrl={baseUrl}
                onAdd={onProductAdd}
              />
            ))}
          </div>
          <LoadMore
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={onLoadMore}
          />
        </>
      )}
    </div>
  );
};

export default POSProductGrid;
