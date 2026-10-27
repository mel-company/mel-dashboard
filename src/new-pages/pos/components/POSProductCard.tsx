import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "../utils";
import { formatPosPrice, getCategoryName, resolvePosImageUrl } from "../utils";

type POSProductCardProps = {
  product: Product;
  baseUrl: string;
  onAdd: (product: Product) => void;
};

/** A product tile: what it is, what it costs, and whether any is left. */
const POSProductCard = ({ product, baseUrl, onAdd }: POSProductCardProps) => {
  const imageSrc = resolvePosImageUrl(product.image, baseUrl);
  const category = product.categories?.[0]
    ? getCategoryName(product.categories[0])
    : null;
  const stock = product.stockTracked ? (product.stock ?? 0) : null;
  const soldOut = stock !== null && stock <= 0;

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      disabled={soldOut}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-right transition-colors",
        "hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
        "dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900",
      )}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain p-2"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Package className="size-8 text-slate-300" />
        )}
        {stock !== null && stock <= 5 ? (
          <span
            className={cn(
              "absolute start-2 top-2 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              soldOut
                ? "bg-slate-900/80 text-white"
                : "bg-white/90 text-slate-700 shadow-sm dark:bg-slate-950/90 dark:text-slate-200",
            )}
          >
            {soldOut ? "نفد" : `متبقي ${stock}`}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <h3
          title={product.title}
          className="line-clamp-2 text-sm [overflow-wrap:anywhere] font-medium leading-5 text-slate-900 dark:text-slate-50">
          {product.title}
        </h3>
        {category ? (
          <p className="line-clamp-1 text-xs text-slate-500">{category}</p>
        ) : null}
        <p className="mt-auto pt-1 text-sm font-bold tabular-nums text-slate-900 dark:text-slate-50">
          {formatPosPrice(product.price)}
        </p>
      </div>
    </button>
  );
};

export default POSProductCard;
