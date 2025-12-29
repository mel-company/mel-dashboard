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
import { useRemoveCategoryFromDiscount } from "@/api/wrappers/discount.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountId: string;
  categoryId: string;
  categoryName: string;
  onSuccess?: () => void;
};

const RemoveCategoryFromDiscountDialog = ({
  open,
  onOpenChange,
  discountId,
  categoryId,
  categoryName,
  onSuccess,
}: Props) => {
  const { mutate: removeCategory, isPending } = useRemoveCategoryFromDiscount();

  const handleRemove = () => {
    removeCategory(
      { id: discountId, categoryId },
      {
        onSuccess: () => {
          toast.success("تم إزالة الفئة من الخصم بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في إزالة الفئة. حاول مرة أخرى."
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
            <DialogTitle className="text-right">إزالة فئة من الخصم</DialogTitle>
          </div>
          <DialogDescription className="text-right">
            هل أنت متأكد من إزالة الفئة <strong>"{categoryName}"</strong> من هذا
            الخصم؟
            <br />
            بعد الإزالة، لن يتم تطبيق الخصم على هذه الفئة.
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
                إزالة الفئة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCategoryFromDiscountDialog;
