import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Trash2,
  Loader2,
  Store,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateStoreLogo,
  useDeleteStoreLogo,
} from "@/api/wrappers/settings.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LogoDialog = ({ open, onOpenChange }: Props) => {
  const { data: storeDetails, refetch: refetchStoreDetails } =
    useFetchStoreDetails();
  const { mutate: updateLogo, isPending: isUpdating } = useUpdateStoreLogo();
  const { mutate: deleteLogo, isPending: isDeleting } = useDeleteStoreLogo();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current logo URL - could be a signed URL or a key
  const currentLogoUrl = storeDetails?.logo;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("الرجاء اختيار ملف صورة");
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن يكون أقل من 2MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("الرجاء اختيار صورة أولاً");
      return;
    }

    updateLogo(selectedFile, {
      onSuccess: () => {
        toast.success("تم تحديث الشعار بنجاح");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        refetchStoreDetails();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "حدث خطأ أثناء تحديث الشعار"
        );
      },
    });
  };

  const handleDelete = () => {
    if (!currentLogoUrl) {
      toast.error("لا يوجد شعار لحذفه");
      return;
    }

    deleteLogo(undefined, {
      onSuccess: () => {
        toast.success("تم حذف الشعار بنجاح");
        refetchStoreDetails();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "حدث خطأ أثناء حذف الشعار"
        );
      },
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  // Reset image error when dialog opens or logo changes
  useEffect(() => {
    if (open) {
      setImageError(false);
    }
  }, [open, currentLogoUrl]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">إدارة شعار المتجر</DialogTitle>
          <DialogDescription className="text-right">
            قم بتحميل شعار جديد أو حذف الشعار الحالي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Logo Display */}
          <div className="space-y-2">
            <Label>الشعار الحالي</Label>
            <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-48 object-contain rounded-lg"
                />
              ) : currentLogoUrl && !imageError ? (
                <img
                  src={currentLogoUrl}
                  alt="Store Logo"
                  className="max-w-full max-h-48 object-contain rounded-lg mx-auto"
                  onError={() => setImageError(true)}
                />
              ) : imageError ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-12 h-12" />
                  <span className="text-sm">لا يمكن عرض الصورة</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Store className="w-16 h-16" />
                  <span className="text-sm">لا يوجد شعار</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload New Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload">رفع شعار جديد</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 ml-2" />
                اختر صورة
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG حتى 2MB</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isUpdating || isDeleting}
            >
              إلغاء
            </Button>
            {selectedFile && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUpdating || isDeleting}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    رفع الشعار
                  </>
                )}
              </Button>
            )}
            {currentLogoUrl && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="flex-1"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف الشعار
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoDialog;
