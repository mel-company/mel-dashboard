import { Link, useNavigate } from "react-router-dom";
import { Package, Pencil, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductCoverImage } from "@/utils/product-images";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import type { ProductListItem } from "@/api/types/product";
import {
  costMargin,
  formatPrice,
  getProductCategories,
  shortDescription,
} from "../utils";

const CATEGORY_STYLES = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
];

function categoryStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_STYLES[Math.abs(hash) % CATEGORY_STYLES.length];
}

type ProductCardsProps = {
  products: ProductListItem[];
  imageBaseUrl?: string;
  onDelete?: (id: string) => void;
};

const ProductCards = ({
  products,
  imageBaseUrl = "",
  onDelete,
}: ProductCardsProps) => {
  const navigate = useNavigate();
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);

  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const cover = getProductCoverImage(product);
        const cats = getProductCategories(product);
        const margin = costMargin(product.price, product.cost_to_produce);

        return (
          <article
            key={product.id}
            className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            {/* Rating */}
            <div className="absolute start-auto end-4 top-4 z-10 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {typeof product.rate === "number"
                ? product.rate.toFixed(1)
                : "—"}
            </div>

            {/* Actions */}
            <div className="absolute start-4 top-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${product.id}/edit`);
                }}
                className="flex size-8 items-center justify-center rounded-xl bg-sky-50 text-sky-500 transition-colors hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300"
                aria-label="تعديل"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(product.id);
                }}
                className="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300"
                aria-label="حذف"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            <Link to={`/products/${product.id}`} className="block text-right">
              <div className="mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900">
                <AssetImage
                  image={cover}
                  baseUrl={resolvedBaseUrl}
                  alt={product.title}
                  className="h-full w-full object-contain"
                  fallback={
                    <Package className="size-12 text-muted-foreground" />
                  }
                />
              </div>

              {cats.length > 0 ? (
                <div className="mb-2 flex flex-wrap justify-start gap-1.5">
                  {cats.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        categoryStyle(c.name),
                      )}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : null}

              <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 dark:text-slate-50">
                {product.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                {shortDescription(product.description, 90)}
              </p>

              <div className="mt-3 flex items-end justify-between gap-2">
                {margin != null ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      margin >= 0
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
                    )}
                  >
                    {margin >= 0 ? "+" : ""}
                    {margin.toFixed(0)}%
                  </span>
                ) : (
                  <span />
                )}
                <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {typeof product.price === "number"
                    ? formatPrice(product.price)
                    : "—"}
                </p>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
};

export default ProductCards;
