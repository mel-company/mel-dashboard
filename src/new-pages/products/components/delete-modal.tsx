import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  productKeys,
  useUpdateProduct,
} from "@/api/wrappers/product.wrappers";
import type { ProductListItem } from "@/api/types/product";
import { getImageUrl } from "@/utils/image-url";
import { getProductCoverImage } from "@/utils/product-images";
import { cn } from "@/lib/utils";
import {
  costMargin,
  formatPrice,
  getProductCategories,
  shortDescription,
} from "../utils";

type Props = {
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;
  products?: ProductListItem[];
  imageBaseUrl?: string;
};

const ProductDeleteModal = ({
  deleteId,
  setDeleteId,
  isDeleting,
  handleDelete,
  products = [],
  imageBaseUrl = "",
}: Props) => {
  const queryClient = useQueryClient();
  const updateProduct = useUpdateProduct();

  const product = useMemo(
    () => products.find((p) => p.id === deleteId) ?? null,
    [products, deleteId],
  );

  const categories = product ? getProductCategories(product) : [];
  const margin =
    product != null
      ? costMargin(product.price, product.cost_to_produce)
      : null;
  const imagePath = product ? getProductCoverImage(product) : "";
  const imageUrl = imagePath ? getImageUrl(imagePath, imageBaseUrl) : "";

  const busy = isDeleting || updateProduct.isPending;

  const handleHide = () => {
    if (!deleteId) return;
    updateProduct.mutate(
      { id: deleteId, data: { enabled: false } },
      {
        onSuccess: () => {
          toast.success("تم إخفاء المنتج — لن يظهر للعملاء");
          setDeleteId(null);
          queryClient.invalidateQueries({ queryKey: productKeys.all });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "فشل إخفاء المنتج",
          );
        },
      },
    );
  };

  return (
    <Dialog
      open={!!deleteId}
      onOpenChange={(open) => {
        if (!open && !busy) setDeleteId(null);
      }}
    >
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-[1.75rem] border-0 bg-white p-0 text-right shadow-2xl sm:max-w-md dark:bg-slate-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <DialogTitle className="text-lg font-bold text-rose-500">
            حذف المنتج
          </DialogTitle>
          <button
            type="button"
            disabled={busy}
            onClick={() => setDeleteId(null)}
            className="flex size-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-500/15 dark:hover:bg-rose-500/25"
            aria-label="إغلاق"
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6">
          {/* Product preview */}
          {product ? (
            <div className="rounded-3xl bg-[#fde8e8] p-3.5 dark:bg-rose-950/40 sm:p-4">
              <div className="relative rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                <div className="absolute end-3 top-3 z-10 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {typeof product.rate === "number"
                    ? product.rate.toFixed(1)
                    : "—"}
                </div>

                <div className="mx-auto mb-3 flex h-36 w-full max-w-[200px] items-center justify-center overflow-hidden sm:h-40 sm:max-w-[220px]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Package className="size-14 text-muted-foreground" />
                  )}
                </div>

                {categories.length > 0 ? (
                  <div className="mb-2.5 flex flex-wrap justify-center gap-1.5">
                    {categories.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="line-clamp-2 text-center text-[15px] font-bold leading-snug text-slate-900 dark:text-slate-50">
                  {product.title}
                </p>
                <p className="mt-1.5 line-clamp-2 text-center text-xs leading-5 text-slate-400">
                  {shortDescription(product.description, 100)}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-start">
                    {margin != null ? (
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          margin >= 0 ? "text-emerald-500" : "text-rose-500",
                        )}
                      >
                        {Math.abs(margin).toFixed(1)}%{" "}
                        {margin >= 0 ? "↗" : "↘"}
                      </p>
                    ) : null}
                    {typeof product.cost_to_produce === "number" ? (
                      <p className="text-xs tabular-nums text-slate-400 line-through">
                        {formatPrice(product.cost_to_produce)}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-end">
                    <p className="text-[11px] text-slate-400">السعر</p>
                    <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-50">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-3xl bg-[#fde8e8] text-sm text-muted-foreground dark:bg-rose-950/40">
              جاري تحميل بيانات المنتج...
            </div>
          )}

          {/* Confirmation copy */}
          <div className="space-y-2 text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              هل انت متأكد من حذف المنتج
            </p>
            <p className="mx-auto max-w-[22rem] text-xs leading-6 text-slate-400">
              سوف تقوم بحذف المنتج من النظام ولن تستطيع أعادته مرة اخرى، يمكنك
              اخفاء المنتج من خيار الاخفاء في بيانات المنتج ولن يظهر للمستخدمين
            </p>
          </div>

          {/* Actions — stacked like mobile Figma */}
          <div className="flex flex-col items-stretch gap-3 pt-1">
            <Button
              type="button"
              disabled={busy || !deleteId}
              onClick={handleHide}
              className="h-12 w-full rounded-2xl bg-rose-100 text-base font-bold text-rose-500 shadow-none hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/30"
            >
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإخفاء...
                </>
              ) : (
                "أخفاء المنتج"
              )}
            </Button>

            <button
              type="button"
              disabled={busy || !deleteId}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="flex h-11 w-full items-center justify-center text-base font-semibold text-slate-700 transition-colors hover:text-rose-600 disabled:opacity-50 dark:text-slate-200 dark:hover:text-rose-300"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف المنتج"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDeleteModal;
