import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, Eye, Pencil, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/utils/image-url";
import type { ProductListItem } from "@/api/types/product";

const CATEGORY_STYLES = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
];

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-IQ")} د.ع`;
}

function shortDescription(text: string | null | undefined, max = 45) {
  if (!text?.trim()) return "—";
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

function getProductCategories(product: ProductListItem) {
  const cats = product.categories ?? [];
  return cats
    .map((c: any, idx: number) => ({
      id: getCategoryId(c, idx),
      name: getCategoryName(c),
    }))
    .filter((c) => c.name);
}

function getCategoryName(c: any): string {
  return c?.category?.name ?? c?.name ?? "";
}

function getCategoryId(c: any, idx: number): string {
  return c?.category?.id ?? c?.id ?? String(idx);
}

function categoryStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_STYLES[Math.abs(hash) % CATEGORY_STYLES.length];
}

function costMargin(price: number, cost: number) {
  if (!cost || cost <= 0) return null;
  return ((price - cost) / cost) * 100;
}

function renderStatus(enabled: boolean) {
  if (enabled) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        متاح
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      مخفي
    </span>
  );
}

function renderCategories(product: ProductListItem) {
  const cats = getProductCategories(product);
  if (cats.length === 0) {
    return <span className="text-xs text-muted-foreground">بدون فئة</span>;
  }
  return (
    <div className="flex max-w-[180px] flex-wrap gap-1.5">
      {cats.slice(0, 3).map((c) => (
        <span
          key={c.id}
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            categoryStyle(c.name),
          )}
        >
          {c.name}
        </span>
      ))}
      {cats.length > 3 && (
        <span className="text-xs text-muted-foreground">+{cats.length - 3}</span>
      )}
    </div>
  );
}

interface ProductTableProps {
  products: ProductListItem[];
  onDelete: (id: string) => void;
}

const ProductTable = ({ products, onDelete }: ProductTableProps) => {
  const navigate = useNavigate();
  const thClass = "h-11 px-4 text-right font-semibold text-muted-foreground";
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";

  return (
    <Card className="overflow-hidden py-0 shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-950">
            <TableHead className={cn(thClass, "w-14")}>#</TableHead>
            <TableHead className={cn(thClass, "w-16")}>الصورة</TableHead>
            <TableHead className={cn(thClass, "min-w-[220px]")}>معلومات المنتج</TableHead>
            <TableHead className={cn(thClass, "min-w-[160px]")}>الفئات</TableHead>
            <TableHead className={thClass}>السعر</TableHead>
            <TableHead className={thClass}>تكلفة المنتج</TableHead>
            <TableHead className={cn(thClass, "w-20")}>التقييم</TableHead>
            <TableHead className={cn(thClass, "w-24")}>الحالة</TableHead>
            <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const margin = costMargin(product.price, product.cost_to_produce);
            return (
              <TableRow
                key={product.id}
                className="cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {String(index + 1).padStart(2, "0")}
                </TableCell>
                <TableCell className={tdClass}>
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.title}
                        className="size-full object-contain p-1"
                      />
                    ) : (
                      <Package className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className={tdClass}>
                  <p className="font-semibold leading-snug">{product.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {shortDescription(product.description, 40)}
                  </p>
                </TableCell>
                <TableCell className={tdClass}>{renderCategories(product)}</TableCell>
                <TableCell className={cn(tdClass, "font-medium tabular-nums")}>
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell className={tdClass}>
                  <p className="font-medium tabular-nums">
                    {product.cost_to_produce
                      ? formatPrice(product.cost_to_produce)
                      : "—"}
                  </p>
                  {margin !== null && (
                    <p
                      className={cn(
                        "mt-0.5 text-xs font-medium tabular-nums",
                        margin >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↑" : "↓"}
                    </p>
                  )}
                </TableCell>
                <TableCell className={tdClass}>
                  {typeof product.rate === "number" ? (
                    <div className="flex items-center justify-end gap-1">
                      <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm tabular-nums">
                        {product.rate.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className={tdClass}>{renderStatus(product.enabled)}</TableCell>
                <TableCell className={tdClass}>
                  <div
                    className="flex items-center justify-end gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/products/${product.id}`)}
                      title="عرض"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      title="تعديل"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(product.id)}
                      title="حذف"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProductTable;
