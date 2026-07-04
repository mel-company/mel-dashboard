import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Badge from "@/components/table/badge";
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
  const categoryName =
    product.categories && product.categories.length > 0
      ? getCategoryName(product.categories[0])
      : null;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white",
        "transition-all hover:border-sky-200 hover:shadow-md",
      )}
    >
      <button
        type="button"
        className="flex flex-1 flex-col p-4 text-right"
        onClick={() => onAdd(product)}
      >
        <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.title}
              className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Package className="size-10 text-slate-300" />
          )}
        </div>

        <h3 className="line-clamp-1 font-semibold text-slate-900">{product.title}</h3>
        {product.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          {categoryName ? <Badge color="purple">{categoryName}</Badge> : <span />}
          <span className="text-base font-bold text-sky-600 tabular-nums">
            {formatPosPrice(product.price)}
          </span>
        </div>
      </button>

      <div className="border-t border-slate-100 p-3">
        <Button
          type="button"
          className="h-10 w-full gap-2 rounded-full bg-sky-500 text-white hover:bg-sky-600"
          onClick={() => onAdd(product)}
        >
          <Plus className="size-4" />
          إضافة للسلة
        </Button>
      </div>
    </article>
  );
};

export default POSProductCard;
