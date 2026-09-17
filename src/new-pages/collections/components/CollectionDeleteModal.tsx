import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteCollection,
  useUpdateCollection,
} from "@/api/wrappers/collection.wrappers";
import ProductThumbnails from "./ProductThumbnails";
import { productCount } from "../utils";

type Props = {
  collection: any | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  imageBaseUrl?: string;
};

/**
 * Delete, or hide.
 *
 * Both are offered because they are genuinely different intentions and the
 * merchant is usually after the second: "شتوي" in July should stop showing on
 * the storefront and come back in December, not be rebuilt from scratch. The
 * products themselves are never touched by either — a collection is only a
 * grouping, and saying so here is what makes the red button safe to press.
 */
const CollectionDeleteModal = ({
  collection,
  onOpenChange,
  onSuccess,
  imageBaseUrl = "",
}: Props) => {
  const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection();
  const { mutate: updateCollection, isPending: isHiding } = useUpdateCollection();
  const busy = isDeleting || isHiding;

  const handleDelete = () => {
    if (!collection?.id) return;
    deleteCollection(collection.id, {
      onSuccess: () => {
        toast.success("تم حذف المجموعة بنجاح");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: any) =>
        toast.error(error?.response?.data?.message || "فشل حذف المجموعة"),
    });
  };

  const handleHide = () => {
    if (!collection?.id) return;
    updateCollection(
      { id: collection.id, data: { enabled: false } },
      {
        onSuccess: () => {
          toast.success("تم إخفاء المجموعة — لن تظهر في المتجر");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) =>
          toast.error(error?.response?.data?.message || "فشل إخفاء المجموعة"),
      },
    );
  };

  return (
    <Dialog
      open={!!collection}
      onOpenChange={(open) => !busy && onOpenChange(open)}
    >
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] gap-6 overflow-y-auto rounded-[2rem] border-0 bg-white p-6 text-right shadow-2xl sm:max-w-[560px] dark:bg-[#12183b]"
      >
        <DialogTitle className="text-xl font-bold text-[#ff5252] sm:text-2xl">
          حذف المجموعة
        </DialogTitle>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-[#1d2757]">
          <ProductThumbnails collection={collection} imageBaseUrl={imageBaseUrl} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">
              {collection?.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">
              {productCount(collection)} منتج
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-[#a4b1fa]">
          سيتم حذف المجموعة فقط — المنتجات بداخلها تبقى في متجرك كما هي.
          إن كنت تريد إعادتها لاحقاً، أخفِها بدل حذفها.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            onClick={handleDelete}
            disabled={busy}
            className="h-11 flex-1 rounded-full bg-[#ff5252] text-white hover:bg-[#ff3b3b]"
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "حذف نهائي"}
          </Button>
          {collection?.enabled ? (
            <Button
              variant="secondary"
              onClick={handleHide}
              disabled={busy}
              className="h-11 flex-1 rounded-full"
            >
              {isHiding ? <Loader2 className="size-4 animate-spin" /> : "إخفاء فقط"}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="h-11 flex-1 rounded-full"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDeleteModal;
