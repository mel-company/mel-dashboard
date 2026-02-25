import { useState, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Save, X, Upload, Loader2 } from "lucide-react";
import { useCreateCategory } from "@/api/wrappers/category.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddCategoryDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createCategory, isPending } = useCreateCategory();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("الرجاء اختيار ملف صورة");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن يكون أقل من 2MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("enabled", enabled.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    createCategory(formData, {
      onSuccess: () => {
        toast.success("تم إضافة الفئة بنجاح");
        setName("");
        setDescription("");
        setEnabled(true);
        handleRemoveImage();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة الفئة. حاول مرة أخرى.",
        );
      },
    });
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setEnabled(true);
    handleRemoveImage();
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
              اسم الفئة *
            </label>
            <Input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الفئة"
              required
              className="text-right"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="category-description"
              className="text-sm font-medium text-right block"
            >
              الوصف *
            </label>
            <Input
              id="category-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الفئة"
              required
              className="text-right"
            />
          </div>

          {/* Image File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">
              صورة الفئة (اختياري)
            </label>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg overflow-hidden shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    لا توجد صورة
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="category-image"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="size-4" />
                    {imageFile ? "تغيير الصورة" : "اختر صورة"}
                  </Button>
                  {imageFile && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      إزالة
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG حتى 2MB
                </p>
              </div>
            </div>
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="gap-2"
              disabled={isPending}
            >
              <X className="size-4" />
              إلغاء
            </Button>
            <Button type="submit" className="gap-2" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? "جاري الحفظ..." : "حفظ الفئة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
