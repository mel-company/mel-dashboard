import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { getProductCoverImage } from "@/utils/product-images";
import Rating from "@/components/table/rating";
import {
  costMargin,
  formatPrice,
  getProductCategories,
  shortDescription,
} from "../utils";
import Badge from "@/components/table/badge";
import ActionBtnList from "@/components/table/action-btn-list";
import type { ProductListItem } from "@/api/types/product";

function renderCategories(product: ProductListItem) {
  const cats = getProductCategories(product);
  if (cats.length === 0) {
    return <span className="text-xs text-slate-400">بدون فئة</span>;
  }
  return (
    <div className="flex max-w-[180px] flex-wrap gap-1.5">
      {cats.slice(0, 3).map((c) => (
        <Badge key={c.id} color="purple">
          {c.name}
        </Badge>
      ))}
      {cats.length > 3 && (
        <span className="text-xs text-slate-400">+{cats.length - 3}</span>
      )}
    </div>
  );
}

function stockStatus(product: ProductListItem) {
  const stock = (product as { stock?: number; quantity?: number }).stock
    ?? (product as { quantity?: number }).quantity;
  if (!product.enabled) {
    return { label: "غير متاح", color: "danger" as const };
  }
  if (typeof stock === "number") {
    if (stock <= 0) return { label: "غير متاح", color: "danger" as const };
    if (stock <= 10) return { label: "قليل", color: "warning" as const };
  }
  return { label: "متاح", color: "success" as const };
}

const ProductRow = ({
  product,
  onDelete,
  rowIndex,
  imageBaseUrl = "",
}: {
  product: ProductListItem;
  onDelete: (id: string) => void;
  rowIndex: number;
  imageBaseUrl?: string;
}) => {
  const navigate = useNavigate();
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
  const margin = costMargin(product.price, product.cost_to_produce);
  const cover = getProductCoverImage(product);
  const status = stockStatus(product);

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <TableCell className={cn(tdClass, "w-14")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-[#e4e7fc]">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={cn(tdClass, "w-16")}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-[#12183b]">
          <AssetImage
            image={cover}
            baseUrl={imageBaseUrl}
            alt={product.title}
            className="block h-12 w-12 object-cover"
            fallback={<Package className="size-5 text-slate-400" />}
          />
        </div>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="line-clamp-1 font-semibold leading-snug text-slate-900 dark:text-[#f0f2ff]">
          {product.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400 dark:text-[#a4b1fa]">
          {shortDescription(product.description, 70)}
        </p>
      </TableCell>
      <TableCell className={tdClass}>{renderCategories(product)}</TableCell>
      <TableCell
        className={cn(
          tdClass,
          "font-medium tabular-nums text-slate-900 dark:text-[#e4e7fc]",
        )}
      >
        {formatPrice(product.price)}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-medium tabular-nums text-slate-900 dark:text-[#e4e7fc]">
          {product.cost_to_produce ? formatPrice(product.cost_to_produce) : "—"}
        </p>
        {margin !== null && (
          <p
            className={cn(
              "mt-0.5 text-xs font-medium tabular-nums",
              margin >= 0
                ? "text-emerald-600 dark:text-[#00dfa8]"
                : "text-red-600 dark:text-[#ff5252]",
            )}
          >
            {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↑" : "↓"}
          </p>
        )}
      </TableCell>
      <TableCell className={tdClass}>
        {typeof product.rate === "number" ? (
          <div className="flex items-center justify-end gap-1">
            <Rating count={product.rate} />
          </div>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color={status.color}>{status.label}</Badge>
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList
          onView={() => navigate(`/products/${product.id}`)}
          onEdit={() => navigate(`/products/${product.id}/edit`)}
          onDelete={() => onDelete(product.id)}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
