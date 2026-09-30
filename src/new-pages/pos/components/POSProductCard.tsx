import { Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "../utils";
import { formatPosPrice, getCategoryName, resolvePosImageUrl } from "../utils";

type POSProductCardProps = {
  product: Product;
  baseUrl: string;
  onAdd: (product: Product) => void;
};

const POSProductCard = ({ product, baseUrl, onAdd }: POSProductCardProps) => {
  const imageSrc = resolvePosImageUrl(product.image, baseUrl);
  const tags = (product.categories ?? [])
    .slice(0, 3)
    .map((c) => getCategoryName(c))
    .filter(Boolean);

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-white text-right",
        "transition-all hover:border-sky-200 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-500/40",
      )}
    >
      <div className="relative flex h-[140px] items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
        {typeof product.rating === "number" && product.rating > 0 ? (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm dark:bg-[#0a0e27]/85 dark:text-[#e4e7fc]">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        ) : null}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.title}
            className="h-full w-full object-contain p-3 transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Package className="size-10 text-slate-300" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        {tags.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-slate-50">
          {product.title}
        </h3>

        {product.description ? (
          <p className="line-clamp-2 text-[11px] leading-4 text-slate-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="text-right">
            <p className="text-[11px] text-slate-400">السعر</p>
            <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
              {formatPosPrice(product.price)}
            </p>
          </div>
          {typeof product.trendPercent === "number" && product.trendPercent !== 0 ? (
            <span
              className={cn(
                "text-[11px] font-bold tabular-nums",
                product.trendPercent < 0 ? "text-destructive" : "text-success",
              )}
            >
              {Math.abs(product.trendPercent)}%
              <span aria-hidden className="ms-0.5">
                {product.trendPercent < 0 ? "↘" : "↗"}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export default POSProductCard;
