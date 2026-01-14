import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Image, ArrowLeft, Loader2, Upload, X } from "lucide-react";
import {
  useFetchProduct,
  useUpdateProduct,
} from "@/api/wrappers/product.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import { toast } from "sonner";
import type { ProductListItem } from "@/api/types/product";

type Props = {};

const EditProduct = ({}: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? "",
    !!id
  );

  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costToProduct, setCostToProduct] = useState("");
  const [image, setImage] = useState("");
  const [rate, setRate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when product data is loaded
  useEffect(() => {
    if (data) {
      const product = data as ProductListItem;
      setTitle(product.title ?? "");
      setDescription(product.description ?? "");
      setPrice(product.price?.toString() ?? "");
      setCostToProduct(product.cost_to_produce?.toString() ?? "");
      setImage(product.image ?? "");
      setRate(product.rate?.toString() ?? "");
      // Map category IDs from product categories
      setSelectedCategories(product.categories?.map((cat) => cat.id) ?? []);
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
      toast.error("معرف المنتج غير موجود");
      return;
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", parseFloat(price).toString());
    formData.append("cost_to_produce", parseFloat(costToProduct).toString());
    formData.append("rate", parseFloat(rate).toString());

    // Add image file if selected
    if (selectedImageFile) {
      formData.append("image", selectedImageFile);
    }

    // Add category IDs if any - send as repeated fields (standard FormData array format)
    selectedCategories.forEach((categoryId) => {
      formData.append("categoryIds", categoryId);
    });

    updateProduct(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المنتج بنجاح");
          navigate(`/products/${id}`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "فشل تحديث المنتج");
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
        <p className="text-muted-foreground">المنتج غير موجود</p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/products")}
        >
          العودة إلى المنتجات
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-right">تعديل المنتج</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">معلومات المنتج الأساسية</p>
        </div>
        <Card className="gap-2">
          <CardContent className="spacey-4">
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-right block">
                صورة المنتج
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
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-12 h-12 object-cover text-muted-foreground" />
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

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-right block"
              >
                العنوان
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المنتج"
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
                placeholder="أدخل وصف المنتج"
                required
                rows={4}
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
            </div>

            {/* Price and Rate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-right block"
                >
                  السعر (دينار عراقي)
                </label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    IQD
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-right block"
                >
                  تكلفة الإنتاج
                </label>
                <div className="relative">
                  <input
                    id="costToProduct"
                    type="number"
                    value={costToProduct}
                    onChange={(e) => setCostToProduct(e.target.value)}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    IQD
                  </span>
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-2">
                <label
                  htmlFor="rate"
                  className="text-sm font-medium text-right block"
                >
                  التقييم (من 5)
                </label>
                <input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="0.0"
                  required
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
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
                تحديث المنتج
                <ArrowLeft className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
