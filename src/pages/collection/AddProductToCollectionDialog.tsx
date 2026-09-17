import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useAddProductsToCollection,
  useFetchAvailableProductsSearchCursor,
} from "@/api/wrappers/collection.wrappers";
import ProductPicker, {
  PRODUCT_PICKER_PAGE_SIZE,
  useDebouncedValue,
} from "./ProductPicker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  onSuccess?: () => void;
};

/**
 * Add products to a collection that already exists.
 *
 * Pages `/collection/:id/product/available`, which excludes what the
 * collection already holds — so the list never offers something that would be
 * a no-op, and the count in the footer is the number of products that will
 * actually be added.
 */
const AddProductToCollectionDialog = ({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(searchQuery.trim());

  const query = useFetchAvailableProductsSearchCursor(
    collectionId,
    { query: debouncedSearch || undefined, limit: PRODUCT_PICKER_PAGE_SIZE },
    open && !!collectionId,
  );

  const { mutate: addProducts, isPending } = useAddProductsToCollection();

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedProductIds([]);
    }
  }, [open]);

  const toggleProduct = (productId: string) =>
    setSelectedProductIds((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );

  const handleSubmit = () => {
    if (!selectedProductIds.length) {
      toast.error("الرجاء اختيار منتج واحد على الأقل");
      return;
    }

    addProducts(
      { id: collectionId, productIds: selectedProductIds },
      {
        onSuccess: () => {
          toast.success("تمت إضافة المنتجات إلى المجموعة");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message || "فشل في إضافة المنتجات. حاول مرة أخرى.",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        dir="rtl"
        className="flex max-h-[80vh] max-w-2xl flex-col text-right"
      >
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-right">
            <Package className="size-5" />
            إضافة منتجات إلى المجموعة
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المنتجات التي تريد إضافتها. المنتجات الموجودة في المجموعة لا
            تظهر هنا.
          </DialogDescription>
        </DialogHeader>

        <ProductPicker
          query={query}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIds={selectedProductIds}
          onToggle={toggleProduct}
        />

        <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !selectedProductIds.length}
            className="gap-2"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            إضافة {selectedProductIds.length || ""}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductToCollectionDialog;
