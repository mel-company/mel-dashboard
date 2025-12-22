import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  Tag,
  Calendar,
  Percent,
  Package,
  Folder,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { DISCOUNT_STATUS } from "@/utils/constants";
import { useFetchProducts } from "@/api/wrappers/product.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import {
  useFetchDiscount,
  useUpdateDiscount,
} from "@/api/wrappers/discount.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import { toast } from "sonner";
import type { ProductListItem } from "@/api/types/product";

type Props = {};

type SelectionMode = "categories" | "products" | "both";

const EditDiscount = ({}: Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch, isFetching } = useFetchDiscount(
    id ?? "",
    !!id
  );

  const { mutate: updateDiscount, isPending: isUpdating } = useUpdateDiscount();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<DISCOUNT_STATUS>(DISCOUNT_STATUS.ACTIVE);

  // Selection mode and selected items
  const [selectionMode, setSelectionMode] =
    useState<SelectionMode>("categories");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Populate form when discount data is loaded
  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setDiscountPercentage(data.discount_percentage?.toString() ?? "");
      setStatus(data.discount_status ?? DISCOUNT_STATUS.ACTIVE);

      // Format dates for datetime-local input
      if (data.discount_start_date) {
        const start = new Date(data.discount_start_date);
        setStartDate(formatDateForInput(start));
      }
      if (data.discount_end_date) {
        const end = new Date(data.discount_end_date);
        setEndDate(formatDateForInput(end));
      }

      // Pre-select products and categories
      const productIds = data.products?.map((p: any) => p.id) ?? [];
      const categoryIds = data.categories?.map((c: any) => c.id) ?? [];

      setSelectedProducts(productIds);
      setSelectedCategories(categoryIds);

      // Determine selection mode
      if (productIds.length > 0 && categoryIds.length > 0) {
        setSelectionMode("both");
      } else if (productIds.length > 0) {
        setSelectionMode("products");
      } else if (categoryIds.length > 0) {
        setSelectionMode("categories");
      } else {
        setSelectionMode("categories");
      }
    }
  }, [data]);

  // Format date for input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch products and categories for selection
  const { data: productsData, isLoading: isLoadingProducts } = useFetchProducts(
    { limit: 1000 },
    selectionMode === "products" || selectionMode === "both"
  );

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useFetchCategories(
      { limit: 1000 },
      selectionMode === "categories" || selectionMode === "both"
    );

  const products: ProductListItem[] = productsData
    ? Array.isArray(productsData)
      ? productsData
      : productsData.data ?? []
    : [];

  const categories: any[] = categoriesData
    ? Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData.data ?? []
    : [];

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("معرف الخصم غير موجود");
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error("تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء");
      return;
    }

    // Validate that at least one product or category is selected
    if (
      selectionMode !== "both" &&
      selectedProducts.length === 0 &&
      selectedCategories.length === 0
    ) {
      toast.error("يجب اختيار منتج واحد على الأقل أو فئة واحدة على الأقل");
      return;
    }

    if (
      selectionMode === "both" &&
      selectedProducts.length === 0 &&
      selectedCategories.length === 0
    ) {
      toast.error("يجب اختيار منتج واحد على الأقل أو فئة واحدة على الأقل");
      return;
    }

    const discountData: any = {
      name,
      description,
      discount_percentage: parseFloat(discountPercentage),
      discount_start_date: startDate,
      discount_end_date: endDate,
      discount_status: status,
    };

    // Always send productIds and categoryIds (empty arrays if not selected)
    if (selectionMode === "products" || selectionMode === "both") {
      discountData.productIds = selectedProducts;
    } else {
      discountData.productIds = [];
    }

    if (selectionMode === "categories" || selectionMode === "both") {
      discountData.categoryIds = selectedCategories;
    } else {
      discountData.categoryIds = [];
    }

    updateDiscount(
      { id, data: discountData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الخصم بنجاح");
          navigate(`/discounts/${id}`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "فشل تحديث الخصم");
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
        <p className="text-muted-foreground">الخصم غير موجود</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/discounts")}
        >
          العودة إلى الخصومات
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">معلومات الخصم الأساسية</p>
        </div>
        <Card className="gap-2">
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-right block"
              >
                اسم الخصم
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم الخصم"
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
                placeholder="أدخل وصف الخصم"
                required
                rows={4}
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
            </div>

            {/* Discount Percentage and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Discount Percentage */}
              <div className="space-y-2">
                <label
                  htmlFor="discountPercentage"
                  className="text-sm font-medium text-right block"
                >
                  نسبة الخصم (%)
                </label>
                <div className="relative">
                  <input
                    id="discountPercentage"
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="0"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-right block"
                >
                  الحالة
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DISCOUNT_STATUS)}
                  required
                  className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value={DISCOUNT_STATUS.ACTIVE}>نشط</option>
                  <option value={DISCOUNT_STATUS.INACTIVE}>غير نشط</option>
                  <option value={DISCOUNT_STATUS.EXPIRED}>منتهي</option>
                </select>
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label
                  htmlFor="startDate"
                  className="text-sm font-medium text-right block"
                >
                  تاريخ البدء
                </label>
                <div className="relative">
                  <input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label
                  htmlFor="endDate"
                  className="text-sm font-medium text-right block"
                >
                  تاريخ الانتهاء
                </label>
                <div className="relative">
                  <input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selection Mode Section */}
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">تطبيق الخصم على</p>
          <p className="text-sm text-muted-foreground mt-1">
            اختر كيفية تطبيق الخصم: على فئات محددة أو منتجات محددة أو كليهما
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {/* Selection Mode Toggle */}
            <div className="flex gap-3 flex-wrap">
              <Button
                type="button"
                variant={selectionMode === "categories" ? "default" : "outline"}
                onClick={() => {
                  setSelectionMode("categories");
                  setSelectedProducts([]);
                }}
                className="gap-2"
              >
                <Folder className="size-4" />
                الفئات فقط
              </Button>
              <Button
                type="button"
                variant={selectionMode === "products" ? "default" : "outline"}
                onClick={() => {
                  setSelectionMode("products");
                  setSelectedCategories([]);
                }}
                className="gap-2"
              >
                <Package className="size-4" />
                المنتجات فقط
              </Button>
              <Button
                type="button"
                variant={selectionMode === "both" ? "default" : "outline"}
                onClick={() => setSelectionMode("both")}
                className="gap-2"
              >
                <Tag className="size-4" />
                الفئات والمنتجات
              </Button>
            </div>

            {/* Categories Selection */}
            {(selectionMode === "categories" || selectionMode === "both") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-right">
                    الفئات ({selectedCategories.length} محددة)
                  </h3>
                  {isLoadingCategories && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {categories.length === 0 && !isLoadingCategories ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد فئات متاحة
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(
                        category.id
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
                      {selectedCategories.map((categoryId) => {
                        const category = categories.find(
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
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Products Selection */}
            {(selectionMode === "products" || selectionMode === "both") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-right">
                    المنتجات ({selectedProducts.length} محددة)
                  </h3>
                  {isLoadingProducts && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {products.length === 0 && !isLoadingProducts ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد منتجات متاحة
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {products.map((product) => {
                      const isSelected = selectedProducts.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProduct(product.id)}
                          className={`relative p-4 bg-card rounded-lg border-2 border-border text-right transition-all hover:shadow-md cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-input bg-card hover:border-ring"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm mb-1">
                                {product.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {product.price?.toFixed(2) ?? "—"} د.ع
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
                {selectedProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2 text-right">
                      المنتجات المحددة ({selectedProducts.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((productId) => {
                        const product = products.find(
                          (p) => p.id === productId
                        );
                        return product ? (
                          <Badge
                            key={productId}
                            variant="default"
                            className="gap-1 px-4"
                          >
                            {product.title}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProduct(productId);
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
                تحديث الخصم
                <ArrowLeft className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditDiscount;
