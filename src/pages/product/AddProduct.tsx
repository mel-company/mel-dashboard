import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  Upload,
  ArrowRight,
  X,
} from "lucide-react";
import { useFilterCategoriesCursor } from "@/api/wrappers/category.wrappers";
import { useCreateProduct } from "@/api/wrappers/product.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { productAPI } from "@/api/endpoints/product.endpoints";
import { variantAPI } from "@/api/endpoints/variant.endpionts";
import { MAX_PRODUCT_IMAGES } from "@/api/types/product";
import { resolveTempImageUrl } from "@/utils/resolve-temp-image-url";
import {
  mergeProductImageFiles,
  revokeObjectUrls,
} from "@/utils/product-images";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductSectionCard } from "@/components/product/tags";
import { ProductCategoriesCard } from "@/components/product/ProductCategoriesCard";
import { ProductPropertiesCard } from "@/components/product/ProductPropertiesCard";
import { ProductOptionsCard } from "@/components/product/ProductOptionsCard";
import { ProductVariantsCard } from "@/components/product/ProductVariantsCard";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debouncedValue;
}

const CURSOR_LIMIT = 20;
const PRODUCT_DESCRIPTION_MAX = 300;

const fieldClass =
  "w-full rounded-2xl border-0 bg-slate-50 px-3 py-2.5 text-right text-sm text-slate-800 outline-none ring-sky-300 placeholder:text-muted-foreground focus:ring-2 dark:bg-slate-900 dark:text-slate-100";

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      {hint ? (
        <span className="text-[11px] text-muted-foreground" dir="ltr">
          {hint}
        </span>
      ) : (
        <span />
      )}
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-muted-foreground"
      >
        {children}
      </label>
    </div>
  );
}

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costToProduct, setCostToProduct] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const loadMoreCategoriesRef = useRef<HTMLDivElement>(null);
  const debouncedCategoryQuery = useDebouncedValue(
    categorySearchQuery.trim(),
    350,
  );

  const {
    data: filterCategoriesData,
    fetchNextPage: fetchNextCategoriesPage,
    hasNextPage: hasNextCategoriesPage,
    isFetchingNextPage: isFetchingNextCategoriesPage,
    isLoading: isCategoriesLoading,
  } = useFilterCategoriesCursor({
    query: debouncedCategoryQuery || undefined,
    limit: CURSOR_LIMIT,
  });

  const categories = filterCategoriesData?.pages.flatMap((p) => p.data) ?? [];

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rate, setRate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [properties, setProperties] = useState<
    Array<{ name: string; value: string }>
  >([]);
  const [options, setOptions] = useState<
    Array<{
      name: string;
      values: Array<{ value: string; label: string }>;
    }>
  >([]);
  const [variants, setVariants] = useState<
    Array<{
      selectedOptionValues: Array<{ optionName: string; value: string }>;
      sku: string;
      qr_code: string;
      price?: string;
      stock: string;
      image?: string;
    }>
  >([]);
  const navigate = useNavigate();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { data: storeDetails } = useFetchStoreDetails();

  const selectedCategoryItems = useMemo(() => {
    return selectedCategories.map((id) => {
      const found = categories.find((c: any) => c.id === id);
      return { id, name: found?.name ?? id };
    });
  }, [selectedCategories, categories]);

  const activePreviewUrl = previewUrls[activePreviewIndex] ?? previewUrls[0] ?? null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = mergeProductImageFiles(imageFiles, e.target.files);
    if (result.error) toast.error(result.error);
    if (result.files === imageFiles) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    revokeObjectUrls(previewUrls);
    const urls = result.files.map((f) => URL.createObjectURL(f));
    setImageFiles(result.files);
    setPreviewUrls(urls);
    setActivePreviewIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImageAt = (index: number) => {
    const nextFiles = imageFiles.filter((_, i) => i !== index);
    const removed = previewUrls[index];
    if (removed) URL.revokeObjectURL(removed);
    const nextUrls = previewUrls.filter((_, i) => i !== index);
    setImageFiles(nextFiles);
    setPreviewUrls(nextUrls);
    setActivePreviewIndex((prev) => {
      if (nextUrls.length === 0) return 0;
      if (prev >= nextUrls.length) return nextUrls.length - 1;
      if (prev > index) return prev - 1;
      return prev;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearImages = () => {
    revokeObjectUrls(previewUrls);
    setImageFiles([]);
    setPreviewUrls([]);
    setActivePreviewIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleLoadMoreCategories = useCallback(() => {
    if (hasNextCategoriesPage && !isFetchingNextCategoriesPage) {
      fetchNextCategoriesPage();
    }
  }, [
    hasNextCategoriesPage,
    isFetchingNextCategoriesPage,
    fetchNextCategoriesPage,
  ]);

  useEffect(() => {
    if (!hasNextCategoriesPage || isFetchingNextCategoriesPage) return;
    const el = loadMoreCategoriesRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMoreCategories();
      },
      { rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    handleLoadMoreCategories,
    hasNextCategoriesPage,
    isFetchingNextCategoriesPage,
  ]);

  const addProperty = () =>
    setProperties((prev) => [...prev, { name: "", value: "" }]);
  const removeProperty = (index: number) =>
    setProperties((prev) => prev.filter((_, i) => i !== index));
  const updateProperty = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    setProperties((prev) =>
      prev.map((prop, i) => (i === index ? { ...prop, [field]: value } : prop)),
    );
  };

  const addOption = () =>
    setOptions((prev) => [
      ...prev,
      { name: "", values: [{ value: "", label: "" }] },
    ]);
  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOptionName = (index: number, name: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, name } : opt)),
    );
  };
  const addOptionValue = (optionIndex: number, text?: string) => {
    const trimmed = text?.trim();
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              values: [
                ...opt.values,
                trimmed
                  ? { value: trimmed, label: trimmed }
                  : { value: "", label: "" },
              ],
            }
          : opt,
      ),
    );
  };
  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              values: opt.values.filter((_, vi) => vi !== valueIndex),
            }
          : opt,
      ),
    );
  };
  const updateOptionValue = (
    optionIndex: number,
    valueIndex: number,
    field: "value" | "label",
    newValue: string,
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              values: opt.values.map((val, vi) =>
                vi === valueIndex ? { ...val, [field]: newValue } : val,
              ),
            }
          : opt,
      ),
    );
  };

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      {
        selectedOptionValues: [],
        sku: "",
        qr_code: "",
        price: "",
        stock: "0",
        image: "",
      },
    ]);
  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));
  const updateVariant = (
    index: number,
    field: "sku" | "qr_code" | "price" | "stock" | "image",
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };
  const toggleVariantOptionValue = (
    variantIndex: number,
    optionName: string,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;
        const existingIndex = variant.selectedOptionValues.findIndex(
          (ov) => ov.optionName === optionName && ov.value === value,
        );
        if (existingIndex >= 0) {
          return {
            ...variant,
            selectedOptionValues: variant.selectedOptionValues.filter(
              (_, idx) => idx !== existingIndex,
            ),
          };
        }
        const filtered = variant.selectedOptionValues.filter(
          (ov) => ov.optionName !== optionName,
        );
        return {
          ...variant,
          selectedOptionValues: [...filtered, { optionName, value }],
        };
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("الرجاء إدخال عنوان المنتج");
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
    if (!price || parseFloat(price) <= 0) {
      toast.error("الرجاء إدخال سعر صحيح للمنتج");
      return;
    }
    if (imageFiles.length === 0) {
      toast.error("الرجاء اختيار صورة واحدة للمنتج على الأقل");
      return;
    }
    // Fallback placeholder for older JSON-create path (multipart usually skips this)
    const tempImageUrl = resolveTempImageUrl(storeDetails);

    const validProperties = properties.filter(
      (prop) => prop.name.trim() && prop.value.trim(),
    );
    const validOptions = options
      .filter((opt) => opt.name.trim() && opt.values.length > 0)
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.values
          .filter((val) => val.value.trim())
          .map((val) => ({
            value: val.value.trim(),
            label: val.label.trim() || val.value.trim(),
          })),
      }))
      .filter((opt) => opt.values.length > 0);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("enabled", "true");
    if (costToProduct) formData.append("cost_to_produce", costToProduct);
    if (rate) formData.append("rate", rate);
    imageFiles.forEach((file) => formData.append("images", file));
    if (imageFiles[0]) formData.append("image", imageFiles[0]);
    if (tempImageUrl) formData.append("tempImageUrl", tempImageUrl);
    if (selectedCategories.length > 0) {
      formData.append("categoryIds", JSON.stringify(selectedCategories));
    }
    if (validProperties.length > 0) {
      formData.append(
        "properties",
        JSON.stringify(
          validProperties.map((prop) => ({
            name: prop.name.trim(),
            value: prop.value.trim(),
          })),
        ),
      );
    }
    if (validOptions.length > 0) {
      formData.append("options", JSON.stringify(validOptions));
    }

    createProduct(formData, {
      onSuccess: async (createdProduct: any) => {
        const validVariants = variants.filter(
          (v) =>
            v.sku.trim() &&
            v.qr_code.trim() &&
            v.selectedOptionValues.length > 0,
        );

        if (validVariants.length > 0 && createdProduct?.id) {
          try {
            const productWithOptions = await productAPI.fetchOne(
              createdProduct.id,
            );
            let successCount = 0;
            for (const variant of validVariants) {
              const optionValueIds: string[] = [];
              variant.selectedOptionValues.forEach((selected) => {
                const option = productWithOptions.options?.find(
                  (opt: any) => opt.name === selected.optionName,
                );
                if (option) {
                  const optionValue = option.values?.find(
                    (val: any) => val.value === selected.value,
                  );
                  if (optionValue) optionValueIds.push(optionValue.id);
                }
              });
              try {
                await variantAPI.create({
                  productId: createdProduct.id,
                  sku: variant.sku.trim(),
                  qr_code: variant.qr_code.trim(),
                  price: variant.price ? parseFloat(variant.price) : undefined,
                  stock: parseInt(variant.stock) || 0,
                  image: variant.image?.trim() || undefined,
                  optionValueIds:
                    optionValueIds.length > 0 ? optionValueIds : undefined,
                });
                successCount++;
              } catch (error) {
                console.error("Error creating variant:", error);
              }
            }
            if (successCount === validVariants.length) {
              toast.success("تم إضافة المنتج والمتغيرات بنجاح");
            } else {
              toast.warning(
                `تم إضافة المنتج ولكن فشل في إضافة ${
                  validVariants.length - successCount
                } من المتغيرات`,
              );
            }
          } catch (error) {
            toast.error("تم إضافة المنتج ولكن فشل في إضافة المتغيرات");
            console.error("Error creating variants:", error);
          }
        } else {
          toast.success("تم إضافة المنتج بنجاح");
        }
        navigate("/products", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة المنتج. حاول مرة أخرى.",
        );
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-right">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200"
            aria-label="رجوع"
          >
            <ArrowRight className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 dark:text-blue-100">
              اضافة منتج
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <Link to="/products" className="hover:underline">
                المنتجات
              </Link>
              <span className="mx-1">›</span>
              <span>اضافة منتج جديد</span>
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isCreating}
          className="h-11 gap-2 rounded-full bg-[#00b7ff] px-5 text-white hover:bg-[#00a3e6]"
        >
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
          )}
          {isCreating ? "جاري الإضافة..." : "اضافة منتج جديد"}
        </Button>
      </div>


      {/* Info + Images */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductSectionCard title="معلومات المنتج">
          <div className="space-y-3">
            <div>
              <FieldLabel htmlFor="title">اسم المنتج</FieldLabel>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل اسم المنتج"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="description"
                hint={`${description.length}/${PRODUCT_DESCRIPTION_MAX}`}
              >
                وصف المنتج
              </FieldLabel>
              <textarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value.slice(0, PRODUCT_DESCRIPTION_MAX),
                  )
                }
                placeholder="أدخل وصف قصير للمنتج"
                required
                rows={4}
                maxLength={PRODUCT_DESCRIPTION_MAX}
                className={cn(fieldClass, "resize-none")}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="price">السعر</FieldLabel>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  required
                  min="0"
                  step="1"
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="costToProduct">تكلفة المنتج</FieldLabel>
                <input
                  id="costToProduct"
                  type="number"
                  value={costToProduct}
                  onChange={(e) => setCostToProduct(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="rate">تقييم المنتج</FieldLabel>
                <input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  max="5"
                  step="0.1"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>
        </ProductSectionCard>

        <ProductSectionCard title="رفع الصور">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            id="product-image"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900"
          >
            {activePreviewUrl ? (
              <img
                src={activePreviewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="size-8" />
                <span className="text-xs">اضغط لرفع صور المنتج</span>
                <span className="text-[11px] text-slate-400">
                  حتى {MAX_PRODUCT_IMAGES} صور · PNG, JPG · 2MB لكل صورة
                </span>
              </div>
            )}
          </button>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageFiles.length >= MAX_PRODUCT_IMAGES}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-sky-400 hover:text-sky-500 disabled:opacity-40 dark:border-slate-700"
            >
              <Plus className="size-5" />
            </button>
            {previewUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2",
                  index === activePreviewIndex
                    ? "border-sky-400"
                    : "border-transparent",
                )}
              >
                <button
                  type="button"
                  onClick={() => setActivePreviewIndex(index)}
                  className="h-full w-full"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-sky-500 px-1 text-[9px] font-bold text-white">
                    رئيسية
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImageAt(index)}
                  className="absolute -left-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                  aria-label="حذف الصورة"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {previewUrls.length === 0 && (
              <div className="flex h-16 flex-1 items-center justify-center rounded-xl bg-slate-50 text-xs text-muted-foreground dark:bg-slate-900">
                PNG, JPG حتى 2MB — أول صورة هي الغلاف
              </div>
            )}
            {previewUrls.length > 0 && (
              <button
                type="button"
                onClick={handleClearImages}
                className="shrink-0 text-xs text-rose-500 underline underline-offset-2"
              >
                مسح الكل
              </button>
            )}
          </div>
        </ProductSectionCard>
      </div>

      {/* Categories + Options */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductCategoriesCard
          productTitle={title}
          selected={selectedCategoryItems}
          categories={categories}
          searchQuery={categorySearchQuery}
          onSearchChange={setCategorySearchQuery}
          onToggle={toggleCategory}
          isLoading={isCategoriesLoading}
          hasMore={hasNextCategoriesPage}
          isLoadingMore={isFetchingNextCategoriesPage}
          onLoadMore={() => fetchNextCategoriesPage()}
          loadMoreRef={loadMoreCategoriesRef}
        />

        <ProductOptionsCard
          options={options}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onChangeOptionName={updateOptionName}
          onAddValue={addOptionValue}
          onRemoveValue={removeOptionValue}
          onChangeValue={updateOptionValue}
          onAddVariantClick={addVariant}
          variantAddedFor={
            variants.length > 0 ? options.map((_, i) => i) : []
          }
        />
      </div>

      {/* Properties + Variants */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductPropertiesCard
          properties={properties}
          onAdd={addProperty}
          onRemove={removeProperty}
          onChange={updateProperty}
        />

        <ProductVariantsCard
          options={options}
          variants={variants}
          onAdd={addVariant}
          onRemove={removeVariant}
          onChange={updateVariant}
          onToggleOptionValue={toggleVariantOptionValue}
        />
      </div>
    </form>
  );
};

export default AddProduct;
