import type { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
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
  const isMobile = useIsMobile();
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();
  const { mutate: toggleCoupon, isPending: isDisabling } =
    useToggleCouponActive();
  const busy = isDeleting || isDisabling;
  const canDisable = !!coupon?.isActive;

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

  const handleDisable = () => {
    if (!coupon?.id) return;
    toggleCoupon(coupon.id, {
      onSuccess: () => {
        toast.success(
          isMobile
            ? "تم إخفاء الكوبون — لن يظهر للعملاء"
            : "تم تعطيل الكوبون — لن يظهر للعملاء",
        );
        onOpenChange(false);
        onSuccess?.();
      },
      onError: () =>
        toast.error(isMobile ? "فشل في إخفاء الكوبون" : "فشل في تعطيل الكوبون"),
    });
  };

  // One body, two shells: Figma draws this centred on desktop and docked to the
  // bottom of the screen on mobile, so only the container differs.
  const Title = isMobile ? SheetTitle : DialogTitle;

  // Both frames offer the same toggleActive escape hatch but name it
  // differently — "تعطيل" on desktop, "إخفاء" on mobile. The copy follows the
  // frame; the action behind it is one call either way.
  const hideLabel = isMobile ? "إخفاء الكوبون" : "تعطيل الكوبون";
  const hideProgress = isMobile ? "جاري الإخفاء..." : "جاري التعطيل...";
  const bodyCopy = isMobile
    ? "سوف تقوم بحذف الكوبون من النظام ولن تستطيع إعادته مرة أخرى، يمكنك إخفاء الكوبون من خيار الإخفاء في بيانات الكوبون ولن يظهر الكوبون للمستخدمين"
    : "سوف تقوم بحذف الكوبون من النظام ولن تستطيع إعادته مرة أخرى، يمكنك إيقاف أو إخفاء الكوبون من بيانات الكوبون ولن يعمل لدى المستخدمين";

  const body: ReactNode = (
    <>
      <div className="flex items-center justify-between">
        <Title className="text-xl font-bold text-[#ff5252] sm:text-2xl">
          {isMobile ? "حذف الكوبون" : "حذف كوبون"}
        </Title>
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
            preview
            className="w-full max-w-[310px] border border-slate-100 shadow-sm dark:border-transparent"
          />
        ) : null}
      </div>

      <div className="space-y-3 text-center sm:space-y-4">
        <p className="text-xl font-bold text-slate-800 dark:text-[#e4e7fc] sm:text-[28px] sm:leading-8">
          هل أنت متأكد من حذف الكوبون
        </p>
        <p className="mx-auto max-w-[34rem] text-sm leading-6 text-slate-400 dark:text-[#a4b1fa] sm:text-lg sm:leading-8">
          {bodyCopy}
        </p>
      </div>

      {/* `Button` carries `shrink-0`, so two `w-full` children in one row
          pushed حذف الكوبون off the edge of the dialog — `flex-1` restores
          shrinking and splits the row as Figma draws it. */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:gap-11">
        <Button
          type="button"
          disabled={busy || !coupon || !canDisable}
          onClick={handleDisable}
          className="h-12 w-full rounded-2xl sm:w-auto sm:flex-1 bg-rose-100 text-base font-bold text-[#ff5252] shadow-none hover:bg-rose-200 sm:h-[60px] sm:text-lg dark:bg-[#ff5252]/10 dark:hover:bg-[#ff5252]/20"
        >
          {isDisabling ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {hideProgress}
            </>
          ) : (
            hideLabel
          )}
        </Button>
        <button
          type="button"
          disabled={busy || !coupon}
          onClick={handleDelete}
          className="flex h-11 w-full items-center justify-center sm:w-auto sm:flex-1 text-base font-bold text-slate-700 transition-colors hover:text-rose-600 disabled:opacity-50 sm:h-[60px] sm:text-lg dark:text-[#e4e7fc] dark:hover:text-[#ff5252]"
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
    </>
  );

  if (isMobile) {
    return (
      <Sheet
        open={!!coupon}
        onOpenChange={(open) => !busy && onOpenChange(open)}
      >
        <SheetContent
          side="bottom"
          dir="rtl"
          showCloseButton={false}
          className={cn(
            "z-[70] inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none",
            "gap-6 overflow-y-auto rounded-t-[32px] border-0 bg-white p-6 text-right",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))] dark:bg-[#12183b]",
          )}
        >
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={!!coupon} onOpenChange={(open) => !busy && onOpenChange(open)}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] gap-6 overflow-y-auto rounded-[2rem] border-0 bg-white p-6 text-right shadow-2xl sm:max-w-[718px] dark:bg-[#12183b]"
      >
        {body}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCouponDialog;
