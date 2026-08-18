import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteCoupon,
  useToggleCouponActive,
} from "@/api/wrappers/coupon.wrappers";
import type { CouponListItem } from "@/api/types/coupon";
import CouponCard from "./CouponCard";

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
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();
  const { mutate: toggleCoupon, isPending: isHiding } = useToggleCouponActive();
  const busy = isDeleting || isHiding;
  const canHide = !!coupon?.isActive;

  const handleDelete = () => {
    if (!coupon?.id) return;
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

  const handleHide = () => {
    if (!coupon?.id) return;
    toggleCoupon(coupon.id, {
      onSuccess: () => {
        toast.success("تم إخفاء الكوبون — لن يظهر للعملاء");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: () => toast.error("فشل في إخفاء الكوبون"),
    });
  };

  return (
    <Dialog open={!!coupon} onOpenChange={(open) => !busy && onOpenChange(open)}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] gap-6 overflow-y-auto rounded-[2rem] border-0 bg-white p-6 text-right shadow-2xl sm:max-w-[718px] dark:bg-[#12183b]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-[#ff5252] sm:text-2xl">
            حذف الكوبون
          </DialogTitle>
          <button
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="flex size-12 items-center justify-center rounded-[14px] border border-[#ff5252]/20 text-[#ff5252] transition-colors hover:bg-[#ff5252]/10 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex justify-center rounded-[28px] bg-[#fde8e8] p-4 dark:bg-[#ff5252]/5 sm:p-8">
          {coupon ? (
            <CouponCard
              coupon={coupon}
              onClick={() => undefined}
              footer={null}
              className="w-full max-w-[310px] border border-slate-100 shadow-sm dark:border-transparent"
            />
          ) : null}
        </div>

        <div className="space-y-3 text-center sm:space-y-4">
          <p className="text-lg font-bold text-slate-800 dark:text-[#e4e7fc] sm:text-[28px] sm:leading-8">
            هل انت متأكد من حذف الكوبون
          </p>
          <p className="mx-auto max-w-[34rem] text-xs leading-6 text-slate-400 dark:text-[#a4b1fa] sm:text-lg sm:leading-8">
            سوف تقوم بحذف الكوبون من النظام ولن تستطيع إعادته مرة أخرى، يمكنك
            إخفاء الكوبون من خيار الإخفاء ولن يظهر للعملاء
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:gap-11">
          <Button
            type="button"
            disabled={busy || !coupon || !canHide}
            onClick={handleHide}
            className="h-12 w-full rounded-2xl bg-rose-100 text-base font-bold text-[#ff5252] shadow-none hover:bg-rose-200 sm:h-[60px] sm:text-lg dark:bg-[#ff5252]/10 dark:hover:bg-[#ff5252]/20"
          >
            {isHiding ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإخفاء...
              </>
            ) : (
              "أخفاء الكوبون"
            )}
          </Button>
          <button
            type="button"
            disabled={busy || !coupon}
            onClick={handleDelete}
            className="flex h-11 w-full items-center justify-center text-base font-bold text-slate-700 transition-colors hover:text-rose-600 disabled:opacity-50 sm:h-[60px] sm:text-lg dark:text-[#e4e7fc] dark:hover:text-[#ff5252]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="me-2 size-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              "حذف الكوبون"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCouponDialog;
