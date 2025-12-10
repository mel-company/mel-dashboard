import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  number_of_products: number;
  image: string;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (
    category: Omit<Category, "id" | "number_of_products">
  ) => void;
};

const AddCategoryDialog = ({ open, onOpenChange, onAddCategory }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryData = {
      name,
      description,
      image: image || "/images/categories/default.jpg",
      enabled,
    };

    onAddCategory(categoryData);

    // Reset form
    setName("");
    setDescription("");
    setImage("");
    setEnabled(true);

    // Close dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setDescription("");
    setImage("");
    setEnabled(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة فئة جديدة</DialogTitle>
          <DialogDescription className="text-right">
            املأ المعلومات التالية لإضافة فئة جديدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-sm font-medium text-right block"
            >
              اسم الفئة
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الفئة"
              required
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="category-description"
              className="text-sm font-medium text-right block"
            >
              الوصف
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الفئة"
              required
              rows={3}
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label
              htmlFor="category-image"
              className="text-sm font-medium text-right block"
            >
              رابط الصورة (اختياري)
            </label>
            <input
              id="category-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-secondary/50">
            <label
              htmlFor="category-enabled"
              className="text-sm font-medium text-right cursor-pointer flex-1"
            >
              تفعيل الفئة
            </label>
            <Switch
              id="category-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" onClick={handleCancel} className="gap-2">
              <X className="size-4" />
              إلغاء
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="size-4" />
              حفظ الفئة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
