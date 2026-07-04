import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDeleteCoupon } from "@/api/wrappers/coupon.wrappers";
import type { CouponListItem } from "@/api/types/coupon";
import {
  formatCouponDate,
  formatCouponUsage,
  formatCouponValue,
  getCouponStatusMeta,
} from "../coupon-utils";

type DeleteCouponDialogProps = {
  coupon: CouponListItem | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const DeleteCouponDialog = ({
  coupon,
  onOpenChange,
  onSuccess,
}: DeleteCouponDialogProps) => {
  const { mutate: deleteCoupon, isPending } = useDeleteCoupon();
  const open = !!coupon;

  if (!coupon) return null;

  const status = getCouponStatusMeta(coupon);

  const handleDelete = () => {
    deleteCoupon(coupon.id, {
      onSuccess: () => {
        toast.success("تم حذف الكوبون");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "فشل في حذف الكوبون";
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
            <h2 className="text-lg font-bold text-blue-950">حذف كوبون</h2>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <Badge className={cn("rounded-full", status.badgeClass)}>
                {status.label}
              </Badge>
              <span className="text-2xl font-black text-amber-600">
                {formatCouponValue(coupon)}
              </span>
            </div>
            <p className="font-semibold text-slate-900" dir="ltr">
              {coupon.code}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {coupon.description || "—"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              استُخدم {formatCouponUsage(coupon)} مرة
            </p>
            <p className="mt-1 text-xs text-slate-400">
              من {formatCouponDate(coupon.startsAt)} إلى{" "}
              {formatCouponDate(coupon.expiresAt)}
            </p>
          </div>

          <p className="mb-2 text-center font-semibold text-slate-800">
            هل أنت متأكد من حذف الكوبون؟
          </p>
          <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
            عند حذف الكوبون لن يعود متاحاً للعملاء ولن تتمكن من استعادته لاحقاً.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              الإبقاء على الكوبون
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "حذف الكوبون"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCouponDialog;
