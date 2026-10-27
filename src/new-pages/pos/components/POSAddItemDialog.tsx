import { useEffect, useMemo, useState } from "react";
import { Loader2, Minus, Package, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFetchVariants } from "@/api/wrappers/variant.wrappers";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "../utils";
import {
  formatPosPrice,
  getCategoryName,
  resolvePosImageUrl,
  variantLabel,
} from "../utils";

export type POSAddItemResult = {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  /** Units on the shelf, or `null` when the product's stock is not counted. */
  stock: number | null;
};

/**
 * The step between tapping a product and the invoice: which variant, and how
 * many.
 *
 * The variant step used to depend on `product.options`, which the POS product
 * list never returns, so it never opened: a product sold in sizes went into
 * the cart with no size and the order was refused at «دفع الفاتورة». The
 * variants are fetched here instead, with their own price and stock, and the
 * count is capped at what is left (less what is already on the invoice).
 */
const POSAddItemDialog = ({
  product,
  baseUrl,
  inCart,
  onOpenChange,
  onConfirm,
}: {
  product: Product | null;
  baseUrl: string;
  /** How many of this product/variant the invoice already holds. */
  inCart: (productId: string, variantId?: string) => number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: POSAddItemResult) => void;
}) => {
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(null);

  const { data: variantsData, isLoading } = useFetchVariants(
    { productId: product?.id },
    !!product,
  );

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setVariantId(null);
    }
  }, [product]);

  const variants: ProductVariant[] = useMemo(
    () => (Array.isArray(variantsData) ? variantsData : []),
    [variantsData],
  );
  // A variant with no option values is only where a plain product keeps its
  // stock; it is not a choice the cashier has to make.
  const choices = variants.filter((v) => (v.optionValues?.length ?? 0) > 0);
  const holder = choices.length === 0 ? variants[0] : undefined;
  const selected = choices.find((v) => v.id === variantId);

  if (!product) return null;

  const chosen = choices.length > 0 ? selected : holder;
  const stock: number | null = chosen ? chosen.stock : null;
  const left =
    stock === null
      ? null
      : Math.max(0, stock - inCart(product.id, selected?.id));
  const price = selected?.price ?? product.price;
  const needsChoice = choices.length > 0 && !selected;
  const soldOut = left !== null && left <= 0;
  const canAdd = !isLoading && !needsChoice && !soldOut;

  const imageSrc = resolvePosImageUrl(
    selected?.image ?? product.image,
    baseUrl,
  );
  const category =
    product.categories?.[0] != null
      ? getCategoryName(product.categories[0])
      : null;

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[90vh] gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 text-right sm:max-w-md dark:bg-slate-950"
      >
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt=""
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <Package className="size-6 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <DialogTitle className="line-clamp-2 text-base [overflow-wrap:anywhere] font-bold text-slate-900 dark:text-slate-50">
                  {product.title}
                </DialogTitle>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">
                  {category ? `${category} · ` : ""}
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                    {formatPosPrice(price)}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-slate-400" />
            </div>
          ) : choices.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:text-slate-300 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-right font-medium">النوع</th>
                    <th className="px-3 py-2 text-center font-medium">السعر</th>
                    <th className="px-3 py-2 text-center font-medium">المخزون</th>
                  </tr>
                </thead>
                <tbody>
                  {choices.map((v) => {
                    const isSelected = v.id === variantId;
                    const out = v.stock <= 0;
                    return (
                      <tr
                        key={v.id}
                        onClick={() => {
                          if (out) return;
                          setVariantId(v.id);
                          setQuantity(1);
                        }}
                        className={cn(
                          "border-t border-slate-100 dark:border-slate-800",
                          out
                            ? "cursor-not-allowed text-slate-400"
                            : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900",
                          isSelected && "bg-slate-100 dark:bg-slate-800",
                        )}
                      >
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-4 shrink-0 rounded-full border",
                                isSelected
                                  ? "border-[5px] border-sky-500"
                                  : "border-slate-300 dark:border-slate-600",
                              )}
                            />
                            <span className="font-medium">{variantLabel(v)}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center tabular-nums">
                          {formatPosPrice(v.price ?? product.price)}
                        </td>
                        <td className="px-3 py-2.5 text-center tabular-nums">
                          {out ? "نفد" : v.stock}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {!isLoading ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  الكمية
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  {needsChoice
                    ? "اختر النوع أولاً"
                    : left === null
                      ? "المخزون غير محدد"
                      : soldOut
                        ? "لا يوجد مخزون متبقٍ"
                        : `المتبقي ${left}`}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-white p-1 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !canAdd}
                  className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="إنقاص الكمية"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={quantity}
                  disabled={!canAdd}
                  onChange={(e) => {
                    const n = Math.floor(Number(e.target.value));
                    if (!Number.isFinite(n)) return;
                    setQuantity(Math.max(1, left === null ? n : Math.min(n, left)));
                  }}
                  className="w-12 bg-transparent text-center text-base font-bold tabular-nums outline-none [appearance:textfield] disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="الكمية"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => (left === null ? q + 1 : Math.min(left, q + 1)))
                  }
                  disabled={!canAdd || (left !== null && quantity >= left)}
                  className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-11 flex-1 rounded-xl text-slate-500 dark:text-slate-300"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              disabled={!canAdd}
              onClick={() =>
                onConfirm({
                  product,
                  variant: selected,
                  quantity,
                  stock,
                })
              }
              className="h-11 flex-[2] rounded-xl bg-sky-500 font-bold text-white hover:bg-sky-600"
            >
              إضافة إلى الفاتورة
              {canAdd && price ? (
                <span className="tabular-nums opacity-90">
                  · {formatPosPrice((price ?? 0) * quantity)}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSAddItemDialog;
