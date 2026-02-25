import { useState, useRef, useEffect } from "react";
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
import { Save, X, Loader2, Upload } from "lucide-react";
import { useUpdateGroup } from "@/api/wrappers/group.wrappers";
import { toast } from "sonner";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  enabled: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  imageBaseUrl?: string;
  onSuccess?: () => void;
};

const EditGroupDialog = ({
  open,
  onOpenChange,
  group,
  imageBaseUrl = "",
  onSuccess,
}: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  const { mutate: updateGroup, isPending } = useUpdateGroup();

  useEffect(() => {
    if (open && group) {
      setName(group.name);
      setDescription(group.description ?? "");
      setEnabled(group.enabled ?? true);
      setImageFile(null);
      setPreviewUrl(null);
      setImageLoadError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, group]);

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
      setImageLoadError(false);
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

    if (!group?.id) return;

    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("enabled", enabled.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    updateGroup(
      { id: group.id, data: formData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المجموعة بنجاح");
          handleRemoveImage();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث المجموعة. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleCancel = () => {
    handleRemoveImage();
    onOpenChange(false);
  };

  const currentImageUrl = previewUrl
    ? previewUrl
    : group?.image
      ? group.image.startsWith("http")
        ? group.image
        : imageBaseUrl
          ? `${imageBaseUrl}/${group.image}`
          : group.image
      : null;

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل المجموعة</DialogTitle>
          <DialogDescription className="text-right">
            قم بتعديل معلومات المجموعة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="edit-group-name"
              className="text-sm font-medium text-right block"
            >
              اسم المجموعة *
            </label>
            <Input
              id="edit-group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم المجموعة"
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-group-description"
              className="text-sm font-medium text-right block"
            >
              الوصف
            </label>
            <Input
              id="edit-group-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف المجموعة"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">
              صورة المجموعة (اختياري)
            </label>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg overflow-hidden shrink-0">
                {currentImageUrl && !imageLoadError ? (
                  <img
                    src={currentImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageLoadError(true)}
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
                  id="edit-group-image"
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
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      إزالة
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG حتى 2MB. اتركه فارغاً للاحتفاظ بالصورة الحالية.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-secondary/50">
            <label className="text-sm font-medium text-right cursor-pointer flex-1">
              تفعيل المجموعة
            </label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
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
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;
