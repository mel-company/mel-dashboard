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
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-[2rem] border-0 bg-white p-0 text-right shadow-2xl sm:max-w-xl dark:bg-[#12183b]"
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5 sm:px-6">
          <DialogTitle className="text-xl font-bold text-[#ff5252] sm:text-2xl">
            حذف المنتج
          </DialogTitle>
          <button
            type="button"
            disabled={busy}
            onClick={() => setDeleteId(null)}
            className="flex size-12 items-center justify-center rounded-[14px] border border-rose-200 bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-[#ff5252]/20 dark:bg-transparent dark:text-[#ff5252] dark:hover:bg-[#ff5252]/10"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6 sm:px-6">
          {product ? (
            <div className="rounded-[28px] bg-[#fde8e8] p-4 dark:bg-[#ff5252]/5 sm:p-8">
              <div className="relative mx-auto max-w-[342px] overflow-hidden rounded-[17px] border border-transparent bg-white p-3 shadow-sm dark:border-[#12183b] dark:bg-[#0a0e27]">
                <div className="relative mb-2.5 overflow-hidden rounded-[11px] bg-slate-50 dark:bg-[#12183b]">
                  <div className="absolute start-3 top-3 z-10 flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-[#e4e7fc]">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {typeof product.rate === "number"
                      ? product.rate.toFixed(1)
                      : "—"}
                  </div>
                  <div className="mx-auto flex h-40 w-full items-center justify-center overflow-hidden sm:h-44">
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
                </div>

                {categories.length > 0 ? (
                  <div className="mb-2 flex flex-wrap justify-end gap-1.5">
                    {categories.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="line-clamp-2 text-right text-[15px] font-medium leading-snug text-slate-900 dark:text-[#f0f2ff]">
                  {product.title}
                </p>
                <p className="mt-1.5 line-clamp-2 text-right text-xs leading-5 text-slate-400 dark:text-[#a4b1fa]">
                  {shortDescription(product.description, 100)}
                </p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-start">
                    {margin != null ? (
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          margin >= 0
                            ? "text-emerald-500 dark:text-[#00dfa8]"
                            : "text-rose-500",
                        )}
                      >
                        {Math.abs(margin).toFixed(1)}%{" "}
                        {margin >= 0 ? "↗" : "↘"}
                      </p>
                    ) : null}
                    {typeof product.cost_to_produce === "number" ? (
                      <p className="text-xs tabular-nums text-slate-400 dark:text-[#e4e7fc]">
                        {formatPrice(product.cost_to_produce)}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-end">
                    <p className="text-[11px] text-slate-400 dark:text-[#31396e]">
                      السعر
                    </p>
                    <p className="text-base font-extrabold tabular-nums text-slate-900 dark:text-[#f0f2ff]">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-[28px] bg-[#fde8e8] text-sm text-muted-foreground dark:bg-[#ff5252]/5">
              جاري تحميل بيانات المنتج...
            </div>
          )}

          <div className="space-y-2 text-center">
            <p className="text-lg font-bold text-slate-800 dark:text-[#e4e7fc] sm:text-[28px] sm:leading-8">
              هل انت متأكد من حذف المنتج
            </p>
            <p className="mx-auto max-w-[34rem] text-xs leading-6 text-slate-400 dark:text-[#a4b1fa] sm:text-lg sm:leading-8">
              سوف تقوم بحذف المنتج من النظام ولن تستطيع أعادته مرة اخرى، يمكنك
              اخفاء المنتج من خيار الاخفاء في بيانات المنتج ولن يظهر للمستخدمين
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row-reverse sm:gap-8">
            <Button
              type="button"
              disabled={busy || !deleteId}
              onClick={handleHide}
              className="h-12 w-full rounded-2xl bg-rose-100 text-base font-bold text-rose-500 shadow-none hover:bg-rose-200 sm:h-[60px] dark:bg-[#ff5252]/10 dark:text-[#ff5252] dark:hover:bg-[#ff5252]/20"
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
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#f5f6fa] text-base font-semibold text-[#3b4656] transition-colors hover:bg-slate-200 disabled:opacity-50 sm:h-[60px] dark:bg-white/5 dark:text-[#e4e7fc] dark:hover:bg-[#ff5252]/10 dark:hover:text-[#ff5252]"
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
