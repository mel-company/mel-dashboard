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
  "bg-[rgba(125,38,247,0.08)] text-[#7d26f7] dark:bg-[#9a5cff]/15 dark:text-[#b282ff]",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  "bg-[#00b7ff]/10 text-[#00b7ff] dark:bg-sky-500/15 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-[rgba(0,184,138,0.1)] text-[#00b88a] dark:bg-emerald-500/15 dark:text-emerald-300",
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => {
        const cover = getProductCoverImage(product);
        const cats = getProductCategories(product);
        const margin = costMargin(product.price, product.cost_to_produce);

        return (
          <article
            key={product.id}
            className="relative overflow-hidden rounded-[18px] border border-[#e7edf6] bg-white p-3 shadow-[0_2px_12px_rgba(17,44,113,0.05)] dark:border-white/[0.06] dark:bg-[#0a0e27] dark:shadow-none"
          >
            <div className="absolute start-auto end-3 top-3 z-10 flex items-center gap-1 text-sm font-semibold text-[#3b4656] dark:text-[#e4e7fc]">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {typeof product.rate === "number"
                ? product.rate.toFixed(1)
                : "—"}
            </div>

            <div className="absolute start-3 top-3 z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${product.id}/edit`);
                }}
                className="flex size-9 items-center justify-center rounded-[10px] bg-[#00b7ff]/10 text-[#00b7ff] transition-colors hover:bg-[#00b7ff]/15 dark:bg-[#33c5ff]/10 dark:text-[#a4b1fa]"
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
                className="flex size-9 items-center justify-center rounded-[10px] bg-[rgba(255,8,8,0.08)] text-[#ff0808] transition-colors hover:bg-[rgba(255,8,8,0.12)] dark:bg-[#ff5252]/15 dark:text-[#ff5252]"
                aria-label="حذف"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            <Link to={`/products/${product.id}`} className="block text-right">
              <div className="mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#f5f6fa] dark:bg-[#12183b]">
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
                <div className="mb-2 flex flex-wrap justify-end gap-1.5">
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

              <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[#04111c] dark:text-[#f0f2ff]">
                {product.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#91a0b6] dark:text-[#a4b1fa]">
                {shortDescription(product.description, 90)}
              </p>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="text-start">
                  {margin != null ? (
                    <p
                      className={cn(
                        "text-[11px] font-semibold",
                        margin >= 0
                          ? "text-[#00b88a] dark:text-[#00dfa8]"
                          : "text-[#ff0808] dark:text-[#ff5252]",
                      )}
                    >
                      {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↗" : "↘"}
                    </p>
                  ) : null}
                  {typeof product.cost_to_produce === "number" &&
                  product.cost_to_produce > 0 &&
                  product.cost_to_produce !== product.price ? (
                    <p className="text-xs tabular-nums text-[#91a0b6] line-through dark:text-[#a4b1fa]/70">
                      {formatPrice(product.cost_to_produce)}
                    </p>
                  ) : null}
                </div>
                <p className="text-base font-bold tabular-nums text-[#04111c] dark:text-[#f0f2ff]">
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
