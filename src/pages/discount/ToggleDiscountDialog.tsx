import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Power, PowerOff } from "lucide-react";
import {
  useEnableDiscount,
  useDisableDiscount,
} from "@/api/wrappers/discount.wrappers";
import { toast } from "sonner";
import { DISCOUNT_STATUS } from "@/utils/constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountId: string;
  discountName: string;
  currentStatus: string;
  onSuccess?: () => void;
};

const ToggleDiscountDialog = ({
  open,
  onOpenChange,
  discountId,
  discountName,
  currentStatus,
  onSuccess,
}: Props) => {
  const isActive = currentStatus === DISCOUNT_STATUS.ACTIVE;
  const { mutate: enableDiscount, isPending: isEnabling } = useEnableDiscount();
  const { mutate: disableDiscount, isPending: isDisabling } =
    useDisableDiscount();

  const isPending = isEnabling || isDisabling;

  const handleToggle = () => {
    if (isActive) {
      disableDiscount(discountId, {
        onSuccess: () => {
          toast.success("تم تعطيل الخصم بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تعطيل الخصم. حاول مرة أخرى."
          );
        },
      });
    } else {
      enableDiscount(discountId, {
        onSuccess: () => {
          toast.success("تم تفعيل الخصم بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تفعيل الخصم. حاول مرة أخرى."
          );
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 mb-2">
            {isActive ? (
              <PowerOff className="size-6 text-destructive" />
            ) : (
              <Power className="size-6 text-green-600" />
            )}
            <DialogTitle className="text-right">
              {isActive ? "تعطيل الخصم" : "تفعيل الخصم"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-right">
            {isActive ? (
              <>
                هل أنت متأكد من تعطيل الخصم <strong>"{discountName}"</strong>؟
                <br />
                بعد التعطيل، لن يتم تطبيق هذا الخصم على المنتجات أو الفئات
                المرتبطة به.
              </>
            ) : (
              <>
                هل أنت متأكد من تفعيل الخصم <strong>"{discountName}"</strong>؟
                <br />
                بعد التفعيل، سيتم تطبيق هذا الخصم على جميع المنتجات أو الفئات
                المرتبطة به.
              </>
            )}
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
            onClick={handleToggle}
            variant={isActive ? "destructive" : "default"}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isActive ? "جاري التعطيل..." : "جاري التفعيل..."}
              </>
            ) : (
              <>
                {isActive ? (
                  <>
                    <PowerOff className="size-4" />
                    تعطيل الخصم
                  </>
                ) : (
                  <>
                    <Power className="size-4" />
                    تفعيل الخصم
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleDiscountDialog;
