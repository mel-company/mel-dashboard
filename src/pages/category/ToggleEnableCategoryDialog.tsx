import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToggleCategoryEnabled } from "@/api/wrappers/category.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  isEnabled: boolean;
  onSuccess?: () => void;
};

const ToggleEnableCategoryDialog = ({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  isEnabled,
  onSuccess,
}: Props) => {
  const { mutate: toggleEnabled, isPending } = useToggleCategoryEnabled();

  const handleToggle = () => {
    toggleEnabled(categoryId, {
      onSuccess: () => {
        toast.success(
          isEnabled ? "تم تعطيل الفئة بنجاح" : "تم تفعيل الفئة بنجاح"
        );
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في تغيير حالة الفئة. حاول مرة أخرى."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 mb-2">
            {isEnabled ? (
              <XCircle className="size-6 text-destructive" />
            ) : (
              <CheckCircle2 className="size-6 text-green-600" />
            )}
            <DialogTitle className="text-right">
              {isEnabled ? "تعطيل الفئة" : "تفعيل الفئة"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-right">
            {isEnabled ? (
              <>
                هل أنت متأكد من تعطيل الفئة <strong>"{categoryName}"</strong>؟
                <br />
                عند التعطيل، لن تظهر هذه الفئة في المتجر ولن يتمكن العملاء من
                الوصول إليها.
              </>
            ) : (
              <>
                هل أنت متأكد من تفعيل الفئة <strong>"{categoryName}"</strong>؟
                <br />
                عند التفعيل، ستظهر هذه الفئة في المتجر وسيتمكن العملاء من الوصول
                إليها.
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
            variant={isEnabled ? "destructive" : "default"}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري التغيير...
              </>
            ) : isEnabled ? (
              <>
                <XCircle className="size-4" />
                تعطيل الفئة
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                تفعيل الفئة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleEnableCategoryDialog;
