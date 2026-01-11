import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, Loader2, Folder, Upload, X } from "lucide-react";
import {
  useFetchCategory,
  useUpdateCategory,
} from "@/api/wrappers/category.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import { toast } from "sonner";

type Props = {};

const EditCategory = ({}: Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch, isFetching } = useFetchCategory(
    id ?? "",
    !!id
  );

  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when category data is loaded
  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setImage(data.image ?? "");
      setEnabled(data.enabled ?? true);
      // Reset image file selection when data loads
      setSelectedImageFile(null);
      setPreviewUrl(null);
    }
  }, [data]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setSelectedImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("معرف الفئة غير موجود");
      return;
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("enabled", enabled.toString());

    // Add image file if selected
    if (selectedImageFile) {
      formData.append("image", selectedImageFile);
    }

    updateCategory(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الفئة بنجاح");
          navigate(`/categories/${id}`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "فشل تحديث الفئة");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">الفئة غير موجودة</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/categories")}
        >
          العودة إلى الفئات
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">معلومات الفئة الأساسية</p>
        </div>
        <Card className="gap-2">
          <CardContent className="space-y-4">
            {/* Image Preview and Input */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-right block">
                صورة الفئة
              </label>
              <div className="flex gap-x-4">
                <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-lg overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const folderIcon = document.createElement("div");
                          folderIcon.className =
                            "flex items-center justify-center w-full h-full";
                          folderIcon.innerHTML =
                            '<svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>';
                          parent.appendChild(folderIcon);
                        }
                      }}
                    />
                  ) : (
                    <Folder className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {previewUrl || image ? "تغيير الصورة" : "اختر صورة"}
                    </Button>
                    {(previewUrl || selectedImageFile) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
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

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-right block"
              >
                اسم الفئة
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم الفئة"
                required
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-right block"
              >
                الوصف
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف الفئة"
                required
                rows={4}
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
            </div>

            {/* Enabled Switch */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-secondary/50">
              <label
                htmlFor="enabled"
                className="text-sm font-medium text-right cursor-pointer flex-1"
              >
                تفعيل الفئة
              </label>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right -mt-2">
              الفئات المفعلة ستظهر للمستخدمين في المتجر
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate(-1)}
            disabled={isUpdating}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            size="lg"
            className="gap-2"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <Save className="size-4" />
                تحديث الفئة
                <ArrowLeft className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
