import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Folder, Search, Check } from "lucide-react";
import { useFetchAvailableCategories } from "@/api/wrappers/category.wrappers";
import { useAddCategoriesToDiscount } from "@/api/wrappers/discount.wrappers";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountId: string;
  existingCategoryIds?: string[];
  onSuccess?: () => void;
};

const AddDiscountCategoryDialog = ({
  open,
  onOpenChange,
  discountId,
  existingCategoryIds = [],
  onSuccess,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const { data: categoriesData, isLoading } = useFetchAvailableCategories(
    { discountId },
    open
  );

  const { mutate: addCategories, isPending } = useAddCategoriesToDiscount();

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedCategoryIds([]);
    }
  }, [open]);

  // Filter categories: exclude already added categories and filter by search
  const categories = categoriesData
    ? Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData.data || []
    : [];

  const availableCategories = categories.filter(
    (category: any) =>
      !existingCategoryIds.includes(category.id) &&
      (category.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase().trim()) ||
        category.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase().trim()))
  );

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = () => {
    if (selectedCategoryIds.length === 0) {
      toast.error("الرجاء اختيار فئة واحدة على الأقل");
      return;
    }

    addCategories(
      { id: discountId, categoryIds: selectedCategoryIds },
      {
        onSuccess: () => {
          toast.success("تم إضافة الفئات إلى الخصم بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في إضافة الفئات. حاول مرة أخرى."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right flex items-center gap-2">
            <Folder className="size-5" />
            إضافة فئات إلى الخصم
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر الفئات التي تريد إضافتها إلى هذا الخصم
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Skeleton className="size-16 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : availableCategories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? "لا توجد فئات تطابق البحث"
                  : "لا توجد فئات متاحة للإضافة"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableCategories.map((category: any) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Folder className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-semibold line-clamp-1">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {isSelected && (
                        <Check className="size-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedCategoryIds.length > 0 && (
          <div className="text-sm text-muted-foreground text-right border-t pt-2">
            تم اختيار {selectedCategoryIds.length} فئة
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || selectedCategoryIds.length === 0}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <Folder className="size-4" />
                إضافة الفئات ({selectedCategoryIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDiscountCategoryDialog;
