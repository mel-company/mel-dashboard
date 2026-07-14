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
import { MAX_PRODUCT_IMAGES } from "@/api/types/product";
import { getImageUrl } from "@/utils/image-url";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import {
  mergeProductImageFiles,
  revokeObjectUrls,
} from "@/utils/product-images";
import { cn } from "@/lib/utils";

type Props = {};

const PRODUCT_DESCRIPTION_MAX = 300;

const EditProduct = ({}: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? "",
    !!id,
  );

  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const imageBaseUrl = useImageBaseUrl();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costToProduct, setCostToProduct] = useState("");
  const [image, setImage] = useState("");
  const [existingImages, setExistingImages] = useState<
    Array<{ id?: string; url: string; isPrimary?: boolean }>
  >([]);
  const [rate, setRate] = useState("");
  // @ts-ignore
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentImageUrl = getImageUrl(image, imageBaseUrl);
  const slotsLeft = Math.max(
    0,
    MAX_PRODUCT_IMAGES - existingImages.length - selectedImageFiles.length,
  );

  // Populate form when product data is loaded
  useEffect(() => {
    if (data) {
      const product = data as ProductListItem;
      setTitle(product.title ?? "");
      setDescription((product.description ?? "").slice(0, PRODUCT_DESCRIPTION_MAX));
      setPrice(product.price?.toString() ?? "");
      setCostToProduct(product.cost_to_produce?.toString() ?? "");
      setImage(product.image ?? "");
      setRate(product.rate?.toString() ?? "");
      setSelectedCategories(product.categories?.map((cat) => cat.id) ?? []);
      const gallery =
        Array.isArray(product.images) && product.images.length > 0
          ? [...product.images].sort(
              (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
            )
          : product.image
            ? [{ url: product.image, isPrimary: true }]
            : [];
      setExistingImages(gallery);
      revokeObjectUrls(previewUrls);
      setSelectedImageFiles([]);
      setPreviewUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = mergeProductImageFiles(
      selectedImageFiles,
      e.target.files,
      Math.max(0, MAX_PRODUCT_IMAGES - existingImages.length),
    );
    if (result.error) toast.error(result.error);
    if (result.files === selectedImageFiles) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    revokeObjectUrls(previewUrls);
    setSelectedImageFiles(result.files);
    setPreviewUrls(result.files.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePendingAt = (index: number) => {
    const removed = previewUrls[index];
    if (removed) URL.revokeObjectURL(removed);
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearPending = () => {
    revokeObjectUrls(previewUrls);
    setSelectedImageFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("معرف المنتج غير موجود");
      return;
    }

    if (!description.trim()) {
      toast.error("الرجاء إدخال وصف المنتج");
      return;
    }

    if (description.trim().length > PRODUCT_DESCRIPTION_MAX) {
      toast.error(`وصف المنتج يجب ألا يتجاوز ${PRODUCT_DESCRIPTION_MAX} حرف`);
      return;
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description.trim().slice(0, PRODUCT_DESCRIPTION_MAX));
    formData.append("price", parseFloat(price).toString());
    formData.append("cost_to_produce", parseFloat(costToProduct).toString());
    formData.append("rate", parseFloat(rate).toString());

    // Add new gallery images if selected
    selectedImageFiles.forEach((file) => formData.append("images", file));
    if (selectedImageFiles[0]) {
      formData.append("image", selectedImageFiles[0]);
    }

    // Add category IDs if any - send as repeated fields (standard FormData array format)
    // selectedCategories.forEach((categoryId) => {
    //   formData.append("categoryIds", categoryId);
    // });

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
      },
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
                صور المنتج
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.id ?? `${img.url}-${idx}`}
                      className={cn(
                        "relative h-24 w-24 overflow-hidden rounded-lg border bg-muted",
                        img.isPrimary && "border-sky-400 ring-1 ring-sky-400",
                      )}
                    >
                      <img
                        src={getImageUrl(img.url, imageBaseUrl) || currentImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 right-1 rounded bg-sky-500 px-1 text-[9px] font-bold text-white">
                          رئيسية
                        </span>
                      )}
                    </div>
                  ))}
                  {existingImages.length === 0 && !previewUrls.length && (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                      <Image className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  {previewUrls.map((url, idx) => (
                    <div
                      key={url}
                      className="relative h-24 w-24 overflow-hidden rounded-lg border border-dashed border-sky-300"
                    >
                      <img
                        src={url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePendingAt(idx)}
                        className="absolute -left-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={slotsLeft <= 0}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    إضافة صور ({slotsLeft} متبقية)
                  </Button>
                  {selectedImageFiles.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearPending}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      إزالة الجديدة
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  حتى {MAX_PRODUCT_IMAGES} صور · PNG, JPG حتى 2MB — إدارة الحذف
                  والتعيين الرئيسي من صفحة التفاصيل
                </p>
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
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground" dir="ltr">
                  {description.length}/{PRODUCT_DESCRIPTION_MAX}
                </span>
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-right block"
                >
                  الوصف / النص الفرعي
                </label>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, PRODUCT_DESCRIPTION_MAX))
                }
                placeholder="أدخل وصف قصير للمنتج"
                required
                rows={4}
                maxLength={PRODUCT_DESCRIPTION_MAX}
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
