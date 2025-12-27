import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import { useCreateProduct } from "@/api/wrappers/product.wrappers";
import { productAPI } from "@/api/endpoints/product.endpoints";
import { variantAPI } from "@/api/endpoints/variant.endpionts";
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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addProperty = () => {
    setProperties((prev) => [...prev, { name: "", value: "" }]);
  };

  const removeProperty = (index: number) => {
    setProperties((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProperty = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    setProperties((prev) =>
      prev.map((prop, i) => (i === index ? { ...prop, [field]: value } : prop))
    );
  };

  // Options management functions
  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { name: "", values: [{ value: "", label: "" }] },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOptionName = (index: number, name: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, name } : opt))
    );
  };

  const addOptionValue = (optionIndex: number) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optionIndex
          ? { ...opt, values: [...opt.values, { value: "", label: "" }] }
          : opt
      )
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
          : opt
      )
    );
  };

  const updateOptionValue = (
    optionIndex: number,
    valueIndex: number,
    field: "value" | "label",
    newValue: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === optionIndex
          ? {
              ...opt,
              values: opt.values.map((val, vi) =>
                vi === valueIndex ? { ...val, [field]: newValue } : val
              ),
            }
          : opt
      )
    );
  };

  // Variants management functions
  const addVariant = () => {
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
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: "sku" | "qr_code" | "price" | "stock" | "image",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const toggleVariantOptionValue = (
    variantIndex: number,
    optionName: string,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        const existingIndex = variant.selectedOptionValues.findIndex(
          (ov) => ov.optionName === optionName && ov.value === value
        );

        if (existingIndex >= 0) {
          // Remove if already selected
          return {
            ...variant,
            selectedOptionValues: variant.selectedOptionValues.filter(
              (_, idx) => idx !== existingIndex
            ),
          };
        } else {
          // Remove any existing value for this option and add new one
          const filtered = variant.selectedOptionValues.filter(
            (ov) => ov.optionName !== optionName
          );
          return {
            ...variant,
            selectedOptionValues: [...filtered, { optionName, value }],
          };
        }
      })
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

    // Filter out empty properties
    const validProperties = properties.filter(
      (prop) => prop.name.trim() && prop.value.trim()
    );

    // Filter and validate options
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
      properties:
        validProperties.length > 0
          ? validProperties.map((prop) => ({
              name: prop.name.trim(),
              value: prop.value.trim(),
            }))
          : undefined,
      options: validOptions.length > 0 ? validOptions : undefined,
    };

    createProduct(productData, {
      onSuccess: async (createdProduct: any) => {
        // If there are variants to create, create them after product is created
        const validVariants = variants.filter(
          (v) =>
            v.sku.trim() &&
            v.qr_code.trim() &&
            v.selectedOptionValues.length > 0
        );

        if (validVariants.length > 0 && createdProduct?.id) {
          // Fetch the created product to get option value IDs
          try {
            const productWithOptions = await productAPI.fetchOne(
              createdProduct.id
            );

            // Create variants one by one
            let successCount = 0;
            for (const variant of validVariants) {
              // Match option values by option name and value
              const optionValueIds: string[] = [];

              variant.selectedOptionValues.forEach((selected) => {
                const option = productWithOptions.options?.find(
                  (opt: any) => opt.name === selected.optionName
                );
                if (option) {
                  const optionValue = option.values?.find(
                    (val: any) => val.value === selected.value
                  );
                  if (optionValue) {
                    optionValueIds.push(optionValue.id);
                  }
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
                } من المتغيرات`
              );
            }
          } catch (error: any) {
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

        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">الخصائص</p>
          <p className="text-sm text-muted-foreground mt-1">
            قم بإضافة خصائص للمنتج (مثل: المادة، العلامة التجارية، الجنس، إلخ)
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  لا توجد خصائص مضافة بعد
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addProperty}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  إضافة خاصية
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label
                          htmlFor={`property-name-${index}`}
                          className="text-sm font-medium text-right block"
                        >
                          اسم الخاصية
                        </label>
                        <input
                          id={`property-name-${index}`}
                          type="text"
                          value={property.name}
                          onChange={(e) =>
                            updateProperty(index, "name", e.target.value)
                          }
                          placeholder="مثال: المادة، العلامة التجارية"
                          className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor={`property-value-${index}`}
                          className="text-sm font-medium text-right block"
                        >
                          قيمة الخاصية
                        </label>
                        <input
                          id={`property-value-${index}`}
                          type="text"
                          value={property.value}
                          onChange={(e) =>
                            updateProperty(index, "value", e.target.value)
                          }
                          placeholder="مثال: قطن، نايك"
                          className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProperty(index)}
                      className="shrink-0 mt-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="حذف الخاصية"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addProperty}
                  className="w-full gap-2"
                >
                  <Plus className="size-4" />
                  إضافة خاصية أخرى
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options Section */}
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">خيارات المنتج</p>
          <p className="text-sm text-muted-foreground mt-1">
            قم بإضافة خيارات للمنتج (مثل: اللون، الحجم، المادة، إلخ)
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {options.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  لا توجد خيارات مضافة بعد
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addOption}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  إضافة خيار
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="p-4 border rounded-lg bg-card space-y-4"
                  >
                    {/* Option Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <label
                          htmlFor={`option-name-${optionIndex}`}
                          className="text-sm font-medium text-right block"
                        >
                          اسم الخيار
                        </label>
                        <input
                          id={`option-name-${optionIndex}`}
                          type="text"
                          value={option.name}
                          onChange={(e) =>
                            updateOptionName(optionIndex, e.target.value)
                          }
                          placeholder="مثال: اللون، الحجم"
                          className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(optionIndex)}
                        className="shrink-0 mt-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="حذف الخيار"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    {/* Option Values */}
                    <div className="space-y-3 pr-4 border-r-2 border-muted">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                          قيم الخيار
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addOptionValue(optionIndex)}
                          className="gap-2"
                        >
                          <Plus className="size-3" />
                          إضافة قيمة
                        </Button>
                      </div>

                      {option.values.length === 0 ? (
                        <div className="text-center py-4 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground mb-2">
                            لا توجد قيم مضافة لهذا الخيار
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOptionValue(optionIndex)}
                            className="gap-2"
                          >
                            <Plus className="size-3" />
                            إضافة قيمة
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {option.values.map((value, valueIndex) => (
                            <div
                              key={valueIndex}
                              className="flex gap-2 items-start p-3 bg-muted/30 rounded-md"
                            >
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`option-${optionIndex}-label-${valueIndex}`}
                                    className="text-xs font-medium text-right block text-muted-foreground"
                                  >
                                    التسمية (اختياري)
                                  </label>
                                  <input
                                    id={`option-${optionIndex}-label-${valueIndex}`}
                                    type="text"
                                    value={value.label}
                                    onChange={(e) =>
                                      updateOptionValue(
                                        optionIndex,
                                        valueIndex,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    placeholder="سيتم استخدام القيمة إذا تركت فارغاً"
                                    className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label
                                    htmlFor={`option-${optionIndex}-value-${valueIndex}`}
                                    className="text-xs font-medium text-right block text-muted-foreground"
                                  >
                                    القيمة
                                  </label>
                                  <input
                                    id={`option-${optionIndex}-value-${valueIndex}`}
                                    type="text"
                                    value={value.value}
                                    onChange={(e) =>
                                      updateOptionValue(
                                        optionIndex,
                                        valueIndex,
                                        "value",
                                        e.target.value
                                      )
                                    }
                                    placeholder="مثال: أحمر، كبير"
                                    className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeOptionValue(optionIndex, valueIndex)
                                }
                                className="shrink-0 mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="حذف القيمة"
                                disabled={option.values.length === 1}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addOption}
                  className="w-full gap-2"
                >
                  <Plus className="size-4" />
                  إضافة خيار آخر
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants Section */}
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">متغيرات المنتج</p>
          <p className="text-sm text-muted-foreground mt-1">
            قم بإضافة متغيرات للمنتج (يتطلب إضافة خيارات أولاً)
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {options.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  لا يمكن إضافة متغيرات بدون خيارات
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  يرجى إضافة خيارات للمنتج أولاً (مثل: اللون، الحجم)
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addOption}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  إضافة خيار
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">
                      لا توجد متغيرات مضافة بعد
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addVariant}
                      className="gap-2"
                    >
                      <Plus className="size-4" />
                      إضافة متغير
                    </Button>
                  </div>
                ) : (
                  <>
                    {variants.map((variant, variantIndex) => {
                      // Get valid options (with at least one value)
                      const validOptions = options.filter(
                        (opt) =>
                          opt.name.trim() &&
                          opt.values.some((v) => v.value.trim())
                      );

                      return (
                        <div
                          key={variantIndex}
                          className="p-4 border rounded-lg bg-card space-y-4"
                        >
                          {/* Variant Header */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-semibold">
                              متغير #{variantIndex + 1}
                            </h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariant(variantIndex)}
                              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="حذف المتغير"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          {/* Option Values Selection */}
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">
                              اختر قيم الخيارات:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {validOptions.map((option) => {
                                const selectedValue =
                                  variant.selectedOptionValues.find(
                                    (ov) => ov.optionName === option.name
                                  )?.value;

                                return (
                                  <div key={option.name} className="space-y-2">
                                    <label className="text-xs font-medium text-right block">
                                      {option.name}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {option.values
                                        .filter((v) => v.value.trim())
                                        .map((val) => {
                                          const isSelected =
                                            selectedValue === val.value;
                                          return (
                                            <button
                                              key={val.value}
                                              type="button"
                                              onClick={() =>
                                                toggleVariantOptionValue(
                                                  variantIndex,
                                                  option.name,
                                                  val.value
                                                )
                                              }
                                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                                isSelected
                                                  ? "bg-primary text-primary-foreground border-primary"
                                                  : "bg-background border-input hover:border-ring"
                                              }`}
                                            >
                                              {val.label || val.value}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Variant Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            {/* SKU */}
                            <div className="space-y-2">
                              <label
                                htmlFor={`variant-sku-${variantIndex}`}
                                className="text-sm font-medium text-right block"
                              >
                                رمز SKU *
                              </label>
                              <input
                                id={`variant-sku-${variantIndex}`}
                                type="text"
                                value={variant.sku}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "sku",
                                    e.target.value
                                  )
                                }
                                placeholder="SKU-001"
                                required
                                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                              />
                            </div>

                            {/* QR Code */}
                            <div className="space-y-2">
                              <label
                                htmlFor={`variant-qr-${variantIndex}`}
                                className="text-sm font-medium text-right block"
                              >
                                رمز QR *
                              </label>
                              <input
                                id={`variant-qr-${variantIndex}`}
                                type="text"
                                value={variant.qr_code}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "qr_code",
                                    e.target.value
                                  )
                                }
                                placeholder="QR-001"
                                required
                                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                              />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                              <label
                                htmlFor={`variant-price-${variantIndex}`}
                                className="text-sm font-medium text-right block"
                              >
                                السعر (اختياري)
                              </label>
                              <div className="relative">
                                <input
                                  id={`variant-price-${variantIndex}`}
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) =>
                                    updateVariant(
                                      variantIndex,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  IQD
                                </span>
                              </div>
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                              <label
                                htmlFor={`variant-stock-${variantIndex}`}
                                className="text-sm font-medium text-right block"
                              >
                                المخزون
                              </label>
                              <input
                                id={`variant-stock-${variantIndex}`}
                                type="number"
                                value={variant.stock}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "stock",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                min="0"
                                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                              />
                            </div>

                            {/* Image */}
                            <div className="space-y-2 md:col-span-2">
                              <label
                                htmlFor={`variant-image-${variantIndex}`}
                                className="text-sm font-medium text-right block"
                              >
                                رابط صورة المتغير (اختياري)
                              </label>
                              <input
                                id={`variant-image-${variantIndex}`}
                                type="url"
                                value={variant.image || ""}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "image",
                                    e.target.value
                                  )
                                }
                                placeholder="https://example.com/image.jpg"
                                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addVariant}
                      className="w-full gap-2"
                    >
                      <Plus className="size-4" />
                      إضافة متغير آخر
                    </Button>
                  </>
                )}
              </div>
            )}
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
