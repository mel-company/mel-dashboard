import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, X } from "lucide-react";

type OrderProduct = {
  id: string;
  quantity: number;
  price: number;
  variant?: {
    id: string;
    optionValues: Array<{
      id: string;
      label: string | null;
      value: string | null;
    }>;
  };
  product?: {
    id: string;
    title: string;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderProduct: OrderProduct | null;
  orderId: string;
  onConfirm: () => void;
  isRemoving?: boolean;
};

// Remove unused orderId from props destructuring (it's kept for API consistency)

const RemoveOrderProduct = ({
  open,
  onOpenChange,
  orderProduct,
  orderId: _orderId, // Kept for API consistency but not used in component
  onConfirm,
  isRemoving = false,
}: Props) => {
  const productTitle = orderProduct?.product?.title || "هذا المنتج";
  const variantInfo =
    orderProduct?.variant?.optionValues
      ?.map((ov) => ov.label || ov.value)
      .join(", ") || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">تأكيد حذف المنتج</DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من حذف المنتج{" "}
            <span className="font-semibold">{productTitle}</span>
            {variantInfo && <> ({variantInfo}) من الطلب؟</>}
            {!variantInfo && " من الطلب؟"}
            <br />
            سيتم استعادة المخزون إذا كان المنتج يحتوي على متغيرات. لا يمكنك
            التراجع عن هذا الإجراء بعد التأكيد.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            <X className="size-4 ml-2" />
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="size-4 animate-spin ml-2" />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="size-4 ml-2" />
                تأكيد الحذف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveOrderProduct;
