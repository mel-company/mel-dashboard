import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { getProductCoverImage } from "@/utils/product-images";
import {
  costMargin,
  formatPrice,
  getProductCategories,
  shortDescription,
} from "../utils";
import Badge from "@/components/table/badge";
import ActionBtnList from "@/components/table/action-btn-list";
import type { ProductListItem } from "@/api/types/product";
import { formatCount } from "@/utils/format-currency";

function renderCategories(product: ProductListItem) {
  const cats = getProductCategories(product);
  if (cats.length === 0) {
    return <span className="text-xs text-[#91a0b6]">بدون فئة</span>;
  }
  return (
    <div className="flex max-w-[180px] flex-wrap justify-end gap-1.5">
      {cats.slice(0, 3).map((c) => (
        <Badge key={c.id} color="purple">
          {c.name}
        </Badge>
      ))}
      {cats.length > 3 && (
        <span className="text-xs text-[#91a0b6]">+{cats.length - 3}</span>
      )}
    </div>
  );
}

function getStockQuantity(product: ProductListItem) {
  const raw = product as ProductListItem & {
    stock?: number;
    quantity?: number;
    totalStock?: number;
  };
  if (typeof raw.stock === "number") return raw.stock;
  if (typeof raw.quantity === "number") return raw.quantity;
  if (typeof raw.totalStock === "number") return raw.totalStock;
  return null;
}

function stockStatus(product: ProductListItem) {
  const stock = getStockQuantity(product);
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
  imageBaseUrl = "",
}: {
  product: ProductListItem;
  onDelete: (id: string) => void;
  rowIndex?: number;
  imageBaseUrl?: string;
}) => {
  const navigate = useNavigate();
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
  const margin = costMargin(product.price, product.cost_to_produce);
  const cover = getProductCoverImage(product);
  const status = stockStatus(product);
  const quantity = getStockQuantity(product);

  return (
    <TableRow
      className="cursor-pointer border-b border-[#e7edf6] transition-colors hover:bg-[#f5f6fa] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <TableCell className={cn(tdClass, "w-16")}>
        <div className="ms-auto flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f5f6fa] dark:bg-[#12183b]">
          <AssetImage
            image={cover}
            baseUrl={imageBaseUrl}
            alt={product.title}
            className="block h-12 w-12 object-cover"
            fallback={<Package className="size-5 text-[#91a0b6]" />}
          />
        </div>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="line-clamp-1 font-semibold leading-snug text-[#04111c] dark:text-[#f0f2ff]">
          {product.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-[#91a0b6] dark:text-[#a4b1fa]">
          {shortDescription(product.description, 70)}
        </p>
      </TableCell>
      <TableCell className={tdClass}>{renderCategories(product)}</TableCell>
      <TableCell
        className={cn(
          tdClass,
          "font-medium tabular-nums text-[#04111c] dark:text-[#e4e7fc]",
        )}
      >
        {quantity != null ? formatCount(quantity) : "—"}
      </TableCell>
      <TableCell
        className={cn(
          tdClass,
          "font-medium tabular-nums text-[#04111c] dark:text-[#e4e7fc]",
        )}
      >
        {formatPrice(product.price)}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-medium tabular-nums text-[#04111c] dark:text-[#e4e7fc]">
          {product.cost_to_produce ? formatPrice(product.cost_to_produce) : "—"}
        </p>
        {margin !== null && (
          <p
            className={cn(
              "mt-0.5 text-xs font-medium tabular-nums",
              margin >= 0
                ? "text-[#00b88a] dark:text-[#00dfa8]"
                : "text-[#ff0808] dark:text-[#ff5252]",
            )}
          >
            {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↗" : "↘"}
          </p>
        )}
      </TableCell>
      <TableCell className={tdClass}>
        {typeof product.rate === "number" ? (
          <div className="flex items-center justify-end gap-1 text-sm font-semibold text-[#3b4656] dark:text-[#e4e7fc]">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {product.rate.toFixed(1)}
          </div>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color={status.color} bold>
          {status.label}
        </Badge>
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
