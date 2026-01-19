import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { useToggleCouponActive } from "@/api/wrappers/coupon.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponId: string;
  couponCode: string;
};

const DisableCouponDialog = ({ open, onOpenChange, couponId, couponCode }: Props) => {
  const { mutate: toggleActive, isPending } = useToggleCouponActive();

  const handleDisable = () => {
    toggleActive(couponId, {
      onSuccess: () => {
        toast.success("تم تعطيل الكوبون بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في تعطيل الكوبون. حاول مرة أخرى."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right flex items-center gap-2">
            <XCircle className="size-5 text-destructive" />
            تأكيد تعطيل الكوبون
          </DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من تعطيل الكوبون "{couponCode}"؟ لن يتمكن العملاء من
            استخدام هذا الكوبون بعد التعطيل.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDisable}
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                جاري التعطيل...
              </>
            ) : (
              <>
                <XCircle className="size-4 mr-2" />
                تأكيد التعطيل
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisableCouponDialog;
