import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useRemoveProductFromDiscount } from "@/api/wrappers/discount.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountId: string;
  productId: string;
  productName: string;
  onSuccess?: () => void;
};

const RemoveProductFromDiscountDialog = ({
  open,
  onOpenChange,
  discountId,
  productId,
  productName,
  onSuccess,
}: Props) => {
  const { mutate: removeProduct, isPending } = useRemoveProductFromDiscount();

  const handleRemove = () => {
    removeProduct(
      { id: discountId, productId },
      {
        onSuccess: () => {
          toast.success("تم إزالة المنتج من الخصم بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في إزالة المنتج. حاول مرة أخرى."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="size-6 text-destructive" />
            <DialogTitle className="text-right">
              إزالة منتج من الخصم
            </DialogTitle>
          </div>
          <DialogDescription className="text-right">
            هل أنت متأكد من إزالة المنتج <strong>"{productName}"</strong> من هذا
            الخصم؟
            <br />
            بعد الإزالة، لن يتم تطبيق الخصم على هذا المنتج.
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
            onClick={handleRemove}
            variant="destructive"
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإزالة...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                إزالة المنتج
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveProductFromDiscountDialog;
