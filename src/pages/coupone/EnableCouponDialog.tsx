import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToggleCouponActive } from "@/api/wrappers/coupon.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponId: string;
  couponCode: string;
};

const EnableCouponDialog = ({ open, onOpenChange, couponId, couponCode }: Props) => {
  const { mutate: toggleActive, isPending } = useToggleCouponActive();

  const handleEnable = () => {
    toggleActive(couponId, {
      onSuccess: () => {
        toast.success("تم تفعيل الكوبون بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في تفعيل الكوبون. حاول مرة أخرى."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            تأكيد تفعيل الكوبون
          </DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من تفعيل الكوبون "{couponCode}"؟ سيصبح الكوبون متاحاً
            للاستخدام من قبل العملاء.
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
            onClick={handleEnable}
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                جاري التفعيل...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-2" />
                تأكيد التفعيل
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnableCouponDialog;
