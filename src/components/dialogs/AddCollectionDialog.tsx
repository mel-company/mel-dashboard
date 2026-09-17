import { useEffect, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCollection } from "@/api/wrappers/collection.wrappers";
import { useFilterProductsCursor } from "@/api/wrappers/product.wrappers";
import ProductPicker, {
  PRODUCT_PICKER_PAGE_SIZE,
  useDebouncedValue,
} from "@/pages/collection/ProductPicker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

/**
 * Create a collection: a name, and the products that go in it.
 *
 * Two things are deliberately absent next to `AddCategoryDialog`.
 *
 * **No image.** A collection has none, so this dialog skips the file input,
 * the 50MB validation, the `tempImageUrl` plumbing and the multipart fallback
 * — and, notably, the `resolveTempImageUrl` guard that makes the category
 * dialog refuse to open at all for a store that has not uploaded a logo.
 *
 * **No second request.** The category and group dialogs create the entity and
 * then link its children in `onSuccess`, which leaves a named-but-empty
 * collection behind a warning toast whenever the second call fails. The
 * endpoint takes `productIds`, so this is one request that either happens or
 * does not.
 */
const AddCollectionDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(searchQuery.trim());

  const { mutate: createCollection, isPending } = useCreateCollection();

  // The whole catalogue: there is no collection yet to exclude members from.
  const query = useFilterProductsCursor(
    { query: debouncedSearch || undefined, limit: PRODUCT_PICKER_PAGE_SIZE },
    open,
  );

  useEffect(() => {
    if (!open) {
      setName("");
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("الرجاء إدخال اسم المجموعة");
      return;
    }

    createCollection(
      {
        name: trimmed,
        // Empty is allowed: naming the collection first and filling it from
        // the detail page is a reasonable way to work.
        productIds: selectedProductIds.length ? selectedProductIds : undefined,
      },
      {
        onSuccess: () => {
          toast.success("تم إنشاء المجموعة بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) =>
          toast.error(error?.response?.data?.message || "فشل إنشاء المجموعة"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        dir="rtl"
        className="flex max-h-[85vh] max-w-2xl flex-col text-right"
      >
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-right">
            <Layers className="size-5" />
            إضافة مجموعة جديدة
          </DialogTitle>
          <DialogDescription className="text-right">
            المجموعة تشكيلة تختارها بنفسك — «صيفي»، «شتوي» — وتظهر للزبون كفلتر
            في صفحة المنتجات.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">اسم المجموعة</Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="صيفي"
              autoFocus
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>المنتجات</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {selectedProductIds.length} محدد
              </span>
            </div>
            <ProductPicker
              query={query}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedIds={selectedProductIds}
              onToggle={toggleProduct}
              emptyLabel="لا توجد منتجات في متجرك بعد"
            />
          </div>

          <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              إنشاء المجموعة
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollectionDialog;
