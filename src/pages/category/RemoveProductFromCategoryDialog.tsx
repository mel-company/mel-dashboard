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
import { useRemoveProductFromCategory } from "@/api/wrappers/category.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  productId: string;
  productName: string;
  onSuccess?: () => void;
};

const RemoveProductFromCategoryDialog = ({
  open,
  onOpenChange,
  categoryId,
  productId,
  productName,
  onSuccess,
}: Props) => {
  const { mutate: removeProduct, isPending } = useRemoveProductFromCategory();

  const handleRemove = () => {
    removeProduct(
      { id: categoryId, productId },
      {
        onSuccess: () => {
          toast.success("تم إزالة المنتج من الفئة بنجاح");
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
              إزالة منتج من الفئة
            </DialogTitle>
          </div>
          <DialogDescription className="text-right">
            هل أنت متأكد من إزالة المنتج <strong>"{productName}"</strong> من هذه
            الفئة؟
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

export default RemoveProductFromCategoryDialog;
