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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown, X } from "lucide-react";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";

type CategoryItem = { id: string; name: string };

export type ProductFilterValues = {
  categoryIds: string[];
  enabled: boolean | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: ProductFilterValues;
  onApply: (values: ProductFilterValues) => void;
  onClear: () => void;
};

const ProductFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [categoryIds, setCategoryIds] = useState<string[]>(values.categoryIds);
  const [enabled, setEnabled] = useState<boolean | undefined>(values.enabled);

  const { data: categoriesData } = useFetchCategories(undefined, open);
  const categories: CategoryItem[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
      ? categoriesData
      : [];

  useEffect(() => {
    if (open) {
      setCategoryIds(values.categoryIds);
      setEnabled(values.enabled);
    }
  }, [open, values.categoryIds, values.enabled]);

  const handleApply = () => {
    onApply({ categoryIds, enabled });
    onOpenChange(false);
  };

  const handleClear = () => {
    setCategoryIds([]);
    setEnabled(undefined);
    onClear();
    onOpenChange(false);
  };

  const toggleCategory = (categoryId: string) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Filter className="size-4" />
            تصفية المنتجات
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المعايير لتصفية قائمة المنتجات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Categories multi-select */}
          <div className="space-y-2">
            <Label className="text-right block">الفئات</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-right font-normal"
                >
                  <span className="truncate text-foreground">
                    {categoryIds.length === 0
                      ? "جميع الفئات"
                      : categoryIds.length === 1
                        ? (categories.find((c) => c.id === categoryIds[0])
                            ?.name ?? "فئة واحدة")
                        : `${categoryIds.length} فئات`}
                  </span>
                  <ChevronDown className="size-4 opacity-50 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto"
              >
                {categories.length === 0 ? (
                  <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                    لا توجد فئات
                  </div>
                ) : (
                  categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.id}
                      checked={categoryIds.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="text-right">{category.name}</span>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Enabled */}
          <div className="space-y-2">
            <Label className="text-right block">الحالة</Label>
            <Select
              value={enabled === undefined ? "all" : enabled ? "yes" : "no"}
              onValueChange={(v) =>
                setEnabled(v === "all" ? undefined : v === "yes")
              }
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">مفعّل</SelectItem>
                <SelectItem value="no">معطّل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleClear} className="gap-2">
            <X className="size-4" />
            مسح
          </Button>
          <Button onClick={handleApply} className="gap-2">
            <Filter className="size-4" />
            تطبيق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFilterDialog;
