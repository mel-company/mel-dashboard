import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Image, ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { dmy_categories } from "@/data/dummy";
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
  const [image, setImage] = useState("");
  const [rate, setRate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Populate form when product data is loaded
  useEffect(() => {
    if (data) {
      const product = data as ProductListItem;
      setTitle(product.title ?? "");
      setDescription(product.description ?? "");
      setPrice(product.price?.toString() ?? "");
      setImage(product.image ?? "");
      setRate(product.rate?.toString() ?? "");
      // Map category IDs from product categories
      setSelectedCategories(product.categories?.map((cat) => cat.id) ?? []);
    }
  }, [data]);

  const toggleCategory = (categoryId: number) => {
    const categoryIdStr = categoryId.toString();
    setSelectedCategories((prev) =>
      prev.includes(categoryIdStr)
        ? prev.filter((id) => id !== categoryIdStr)
        : [...prev, categoryIdStr]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("معرف المنتج غير موجود");
      return;
    }

    const productData = {
      title,
      description,
      price: parseFloat(price),
      image: image || null,
      rate: parseFloat(rate),
      categories: selectedCategories.map((id) => parseInt(id)),
    };

    updateProduct(
      { id, data: productData },
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
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold text-right">تعديل المنتج</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">معلومات المنتج الأساسية</p>
        </div>
        <Card className="gap-2">
          <CardContent className="spacey-4">
            <div className="flex gap-x-2 mb-4">
              <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-12 h-12 object-cover text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2 flex items-center">
                <div>
                  <h3 className="text-xl font-bold">صورة المنتج</h3>
                  <p className="text-sm text-muted-foreground">
                    يمكنك تحديث صورة المنتج من خلال التحديد من الملفات المحلية
                  </p>
                </div>
              </div>
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="image"
                className="text-sm font-medium text-right block"
              >
                رابط الصورة
              </label>
              <input
                id="image"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="أدخل رابط الصورة"
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
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

        {/* Categories Section */}
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">الفئات</p>
          <p className="text-sm text-muted-foreground mt-1">
            اختر فئة واحدة أو أكثر للمنتج
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {dmy_categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد فئات متاحة
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dmy_categories.map((category) => {
                  const isSelected = selectedCategories.includes(
                    category.id.toString()
                  );
                  return (
                    <div
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-4 bg-card rounded-lg border-2 border-border text-right transition-all hover:shadow-md cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-input bg-card hover:border-ring"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
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
                    </div>
                  );
                })}
              </div>
            )}
            {selectedCategories.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2 text-right">
                  الفئات المحددة ({selectedCategories.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryIdStr) => {
                    const categoryId = parseInt(categoryIdStr);
                    const category = dmy_categories.find(
                      (c) => c.id === categoryId
                    );
                    return category ? (
                      <Badge
                        key={categoryIdStr}
                        variant="default"
                        className="gap-1 px-4"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(categoryId);
                          }}
                          className="hover:bg-primary/20 rounded-full p-0.5 -mr-1"
                        >
                          <X className="size-3" />
                          <span className="sr-only">إزالة</span>
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
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
