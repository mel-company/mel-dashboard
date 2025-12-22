import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import { useCreateProduct } from "@/api/wrappers/product.wrappers";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Props = {};

const AddProduct = ({}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costToProduct, setCostToProduct] = useState("");

  const { data: categories, isLoading } = useFetchCategories();

  const [image, setImage] = useState("");
  const [rate, setRate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      toast.error("الرجاء إدخال عنوان المنتج");
      return;
    }

    if (!description.trim()) {
      toast.error("الرجاء إدخال وصف المنتج");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("الرجاء إدخال سعر صحيح للمنتج");
      return;
    }

    if (!image.trim()) {
      toast.error("الرجاء إدخال رابط صورة المنتج");
      return;
    }

    const productData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      cost_to_produce: costToProduct ? parseFloat(costToProduct) : undefined,
      image: image.trim(),
      rate: rate ? parseFloat(rate) : undefined,
      enabled: true,
      categoryIds:
        selectedCategories.length > 0 ? selectedCategories : undefined,
    };

    createProduct(productData, {
      onSuccess: () => {
        toast.success("تم إضافة المنتج بنجاح");
        navigate("/products", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة المنتج. حاول مرة أخرى."
        );
      },
    });
  };

  return (
    <div className="mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">معلومات المنتج الأساسية</p>
        </div>
        <Card className="gap-2">
          <CardContent className="spacey-4">
            {/* Image URL */}
            <div className="space-y-2">
              <label
                htmlFor="image"
                className="text-sm font-medium text-right block"
              >
                رابط صورة المنتج
              </label>
              <input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
                className="w-full text-right rounded-md border border-input bgbackground py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 "
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
                className="w-full text-right rounded-md border border-input bgbackground py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 "
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
                className="w-full text-right rounded-md border border-input bgbackground py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
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
                  السعر
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
                    className="w-full text-right rounded-md border border-input bgbackground py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 "
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    IQD
                  </span>
                </div>
              </div>

              {/* Cost to Product */}
              <div className="space-y-2">
                <label
                  htmlFor="costToProduct"
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
                    className="w-full text-right rounded-md border border-input bgbackground py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 "
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
                  className="w-full text-right rounded-md border border-input bgbackground py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 "
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
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="relative p-4 bg-card rounded-lg border-2 border-border text-right"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                      <Skeleton className="shrink-0 w-5 h-5 rounded border-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categories && categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد فئات متاحة
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category: any) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      // type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-4 bg-card rounded-lg border-2 border-border text-right transition-all hover:shadow-md ${
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
                  {/* {selectedCategories.map((categoryId) => {
                    const category = dmy_categories.find(
                      (c) => c.id === categoryId
                    );
                    return category ? (
                      <Badge
                        key={categoryId}
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
                  })} */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            size="lg"
            className="gap-2"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <Save className="size-4" />
                إضافة المنتج
                <ArrowLeft className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
