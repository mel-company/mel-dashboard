import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Pencil, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  productKeys,
  useUpdateProduct,
} from "@/api/wrappers/product.wrappers";
import type { ProductListItem } from "@/api/types/product";
import { getImageUrl } from "@/utils/image-url";
import { getProductCoverImage } from "@/utils/product-images";
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
        className="gap-0 overflow-hidden rounded-3xl border-0 p-0 text-right shadow-xl sm:max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <DialogTitle className="text-lg font-bold text-[#1a2b5a]">
            حذف المنتج
          </DialogTitle>
          <button
            type="button"
            disabled={busy}
            onClick={() => setDeleteId(null)}
            className="flex size-8 items-center justify-center rounded-xl bg-sky-100 text-[#1a2b5a] hover:bg-sky-200"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 pb-5">
          {/* Product preview card */}
          {product ? (
            <div className="relative rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  <Star className="size-3 fill-white" />
                  {typeof product.rate === "number"
                    ? product.rate.toFixed(0)
                    : "—"}
                </span>
              </div>
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
                  <Pencil className="size-3.5" />
                </span>
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                  <Trash2 className="size-3.5" />
                </span>
              </div>

              <div className="mx-auto mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-950">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Package className="size-12 text-muted-foreground" />
                )}
              </div>

              {categories.length > 0 && (
                <div className="mb-2 flex flex-wrap justify-end gap-1.5">
                  {categories.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="line-clamp-1 text-sm font-bold text-[#1a2b5a] dark:text-blue-100">
                {product.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {shortDescription(product.description, 90)}
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="text-left">
                  {margin != null && (
                    <p
                      className={
                        margin >= 0
                          ? "text-xs font-semibold text-emerald-600"
                          : "text-xs font-semibold text-red-500"
                      }
                    >
                      {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↗" : "↘"}
                    </p>
                  )}
                  <p className="text-sm font-bold tabular-nums text-[#1a2b5a] dark:text-blue-100">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">السعر</p>
                  <p className="text-sm font-bold tabular-nums text-[#1a2b5a] dark:text-blue-100">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-50 text-sm text-muted-foreground">
              جاري تحميل بيانات المنتج...
            </div>
          )}

          {/* Message */}
          <div className="space-y-1.5 text-right">
            <p className="text-base font-bold text-[#1a2b5a] dark:text-blue-100">
              هل انت متأكد من حذف المنتج
            </p>
            <p className="text-xs leading-6 text-slate-500">
              هذا الإجراء نهائي ولا يمكن التراجع عنه. إذا كنت لا تريد إزالة المنتج
              نهائياً، يمكنك إخفاءه بدل الحذف حتى لا يظهر للعملاء.
            </p>
          </div>

          {/* Actions — يمين حذف / يسار إخفاء */}
          <div
            dir="rtl"
            className="grid grid-cols-2 gap-3 pt-1"
          >
            <Button
              type="button"
              disabled={busy || !deleteId}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="h-11 rounded-2xl bg-sky-100 text-sky-800 hover:bg-sky-200"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف المنتج"
              )}
            </Button>
            <Button
              type="button"
              disabled={busy || !deleteId}
              onClick={handleHide}
              className="h-11 rounded-2xl bg-rose-100 text-rose-600 hover:bg-rose-200"
            >
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري الإخفاء...
                </>
              ) : (
                "أخفاء المنتج"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDeleteModal;
