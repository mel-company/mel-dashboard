import { useEffect, useState } from "react";
import { Minus, Package, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Product } from "../utils";
import { formatPosPrice, getCategoryName, resolvePosImageUrl } from "../utils";

/**
 * Figma's «أضافة عنصر الى فاتورة المبيعات» step. A tap used to drop the
 * product straight into the cart at quantity 1, so selling five of
 * something meant five taps or a trip to the cart's stepper.
 */
const POSAddItemDialog = ({
  product,
  baseUrl,
  onOpenChange,
  onConfirm,
}: {
  product: Product | null;
  baseUrl: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: Product, quantity: number) => void;
}) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) setQuantity(1);
  }, [product]);

  if (!product) return null;

  const imageSrc = resolvePosImageUrl(product.image, baseUrl);
  const category =
    product.categories?.[0] != null
      ? getCategoryName(product.categories[0])
      : null;

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="gap-6 rounded-[2rem] border-0 bg-white p-6 text-right shadow-2xl sm:max-w-[520px] dark:bg-[#12183b]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-[#00b7ff] dark:text-[#33c5ff]">
            أضافة عنصر الى فاتورة المبيعات
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-10 items-center justify-center rounded-[14px] text-slate-400 transition-colors hover:bg-slate-100 dark:text-[#a4b1fa] dark:hover:bg-white/5"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* The product being added, as drawn. */}
        <div className="flex justify-center rounded-[24px] bg-slate-50 p-5 dark:bg-white/[0.03]">
          <div className="w-full max-w-[280px] overflow-hidden rounded-[18px] border border-slate-100 bg-white dark:border-white/[0.06] dark:bg-[#0a0e27]">
            <div className="flex h-28 items-center justify-center bg-slate-50 dark:bg-[#12183b]">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <Package className="size-8 text-slate-300" />
              )}
            </div>
            <div className="space-y-1 p-3">
              {category ? (
                <span className="inline-block rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300">
                  {category}
                </span>
              ) : null}
              <p className="line-clamp-2 text-xs font-bold text-slate-900 dark:text-slate-50">
                {product.title}
              </p>
              <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
                {formatPosPrice(product.price)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-[#e4e7fc]">
            أضافة {product.title}
          </p>
          <p className="mx-auto max-w-sm text-xs leading-6 text-slate-400 dark:text-[#a4b1fa]">
            سوف تقوم بأضافة {product.title} الى قائمة المبيعات
          </p>
        </div>

        {/* RTL: `+` leads on the right, as drawn. */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-10 items-center justify-center rounded-xl bg-[#00b7ff]/10 text-[#00b7ff] transition-colors hover:bg-[#00b7ff]/20 dark:text-[#33c5ff]"
            aria-label="زيادة الكمية"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
          <span
            dir="ltr"
            className="min-w-12 text-center text-xl font-bold tabular-nums text-slate-900 dark:text-[#e4e7fc]"
          >
            {String(quantity).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-40 dark:bg-white/[0.06] dark:text-[#a4b1fa] dark:hover:bg-white/10"
            aria-label="إنقاص الكمية"
          >
            <Minus className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onConfirm(product, quantity)}
            className={cn(
              "h-12 min-w-[180px] rounded-2xl border border-[#00b7ff]/40 bg-[#00b7ff]/10 px-8 text-base font-bold",
              "text-[#00b7ff] transition-colors hover:bg-[#00b7ff]/20 dark:text-[#33c5ff]",
            )}
          >
            أضافة
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-12 min-w-[120px] text-base font-bold text-slate-400 transition-colors hover:text-slate-600 dark:text-[#4a5596] dark:hover:text-[#e4e7fc]"
          >
            الغاء
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSAddItemDialog;
