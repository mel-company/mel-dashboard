import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useDeleteDiscount,
  useDisableDiscount,
} from "@/api/wrappers/discount.wrappers";
import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";
import {
  formatDiscountDate,
  getDiscountScope,
  getDiscountStatusMeta,
} from "../utils";

type DeleteDiscountDialogProps = {
  discount: DiscountListItem | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const DeleteDiscountDialog = ({
  discount,
  onOpenChange,
  onSuccess,
}: DeleteDiscountDialogProps) => {
  const { mutate: deleteDiscount, isPending: isDeleting } = useDeleteDiscount();
  const { mutate: disableDiscount, isPending: isDisabling } = useDisableDiscount();

  const isPending = isDeleting || isDisabling;
  const open = !!discount;

  if (!discount) return null;

  const status = getDiscountStatusMeta(discount.discount_status);
  const canDisable = discount.discount_status === DISCOUNT_STATUS.ACTIVE;

  const handleDelete = () => {
    deleteDiscount(discount.id, {
      onSuccess: () => {
        toast.success("تم حذف الخصم");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "فشل في حذف الخصم";
        toast.error(msg);
      },
    });
  };

  const handleDisable = () => {
    disableDiscount(discount.id, {
      onSuccess: () => {
        toast.success("تم إيقاف الخصم");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "فشل في إيقاف الخصم";
        toast.error(msg);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-0" dir="rtl">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-lg font-bold text-blue-950">حذف خصم</h2>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <Badge className={cn("rounded-full", status.badgeClass)}>
                {status.label}
              </Badge>
              <span className="text-2xl font-black text-violet-600">
                {discount.discount_percentage}%
              </span>
            </div>
            <p className="font-semibold text-slate-900">{discount.name}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {discount.description}
            </p>
            <p className="mt-2 text-xs text-slate-500">{getDiscountScope(discount)}</p>
            <p className="mt-1 text-xs text-slate-400">
              من {formatDiscountDate(discount.discount_start_date)} إلى{" "}
              {formatDiscountDate(discount.discount_end_date)}
            </p>
          </div>

          <p className="mb-2 text-center font-semibold text-slate-800">
            هل أنت متأكد من حذف الخصم؟
          </p>
          <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
            عند حذف الخصم لن يعود متاحاً للعملاء. يمكنك إيقاف الخصم بدلاً من ذلك
            ليظل محفوظاً دون تطبيقه على الطلبات.
          </p>

          <div className="flex gap-3">
            {canDisable && (
              <button
                type="button"
                onClick={handleDisable}
                disabled={isPending}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDisabling ? <Loader2 className="size-4 animate-spin" /> : "إيقاف خصم"}
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "حذف خصم"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDiscountDialog;
