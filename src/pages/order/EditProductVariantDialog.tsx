import { useState, useEffect, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, X, Loader2 } from "lucide-react";
import { useFetchVariant } from "@/api/wrappers/variant.wrappers";
import {
  useFetchProduct,
  useFindVariantByOptions,
} from "@/api/wrappers/product.wrappers";
import { useUpdateOrderProduct } from "@/api/wrappers/order.wrappers";
import { toast } from "sonner";

type OrderProduct = {
  id: string;
  quantity: number;
  price: number;
  variant?: {
    id: string;
    optionValues: Array<{
      id: string;
      label: string | null;
      value: string | null;
      option?: {
        id: string;
        name: string;
      };
    }>;
  };
  product?: {
    id: string;
    title: string;
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderProduct: OrderProduct | null;
  orderId: string;
  onSuccess?: () => void;
};

type ProductVariant = {
  id: string;
  sku: string;
  qr_code: string;
  price: number | null;
  stock: number;
  image?: string | null;
  optionValues: Array<{
    id: string;
    label: string | null;
    value: string | null;
  }>;
};

const EditProductVariantDialog = ({
  open,
  onOpenChange,
  orderProduct,
  orderId,
  onSuccess,
}: Props) => {
  const [quantity, setQuantity] = useState("1");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [foundVariant, setFoundVariant] = useState<ProductVariant | null>(null);
  const [isFindingVariant, setIsFindingVariant] = useState(false);

  const variantId = orderProduct?.variant?.id;
  const productId = orderProduct?.product?.id;

  const { data: variantData, isLoading: isLoadingVariant } = useFetchVariant(
    variantId || "",
    open && !!variantId
  );

  // Get productId from variantData if not available in orderProduct
  const finalProductId = productId || variantData?.productId;

  const { data: productData, isLoading: isLoadingProduct } = useFetchProduct(
    finalProductId || "",
    !!finalProductId && open
  );

  const { mutateAsync: findVariantByOptions } = useFindVariantByOptions();
  const { mutate: updateOrderProduct, isPending: isUpdating } =
    useUpdateOrderProduct();

  // Find matching variant based on selected options using API (same logic as POS)
  const findMatchingVariant = useCallback(
    async (
      product: any,
      options: Record<string, string>
    ): Promise<ProductVariant | null> => {
      // If product has no options, return null (product without variants)
      if (!product.options || product.options.length === 0) {
        setFoundVariant(null);
        return null;
      }

      // If no options are selected, return null
      if (Object.keys(options).length === 0) {
        setFoundVariant(null);
        return null;
      }

      setIsFindingVariant(true);
      try {
        const variant = await findVariantByOptions({
          productId: product.id,
          selectedOptions: options,
        });

        if (!variant) {
          setFoundVariant(null);
          return null;
        }

        // Map the API response to ProductVariant type
        const mappedVariant: ProductVariant = {
          id: variant.id,
          sku: variant.sku,
          qr_code: variant.qr_code,
          price: variant.price,
          stock: variant.stock,
          image: variant.image,
          optionValues:
            variant.optionValues?.map((ov: any) => ({
              id: ov.id,
              label: ov.label,
              value: ov.value,
            })) || [],
        };

        setFoundVariant(mappedVariant);
        return mappedVariant;
      } catch (error: any) {
        console.error("Error finding variant:", error);
        toast.error(
          error?.response?.data?.message ||
            "فشل في العثور على المتغير. حاول مرة أخرى."
        );
        setFoundVariant(null);
        return null;
      } finally {
        setIsFindingVariant(false);
      }
    },
    [findVariantByOptions]
  );

  // Initialize form with order product data
  useEffect(() => {
    if (open && orderProduct) {
      setQuantity(orderProduct.quantity?.toString() || "1");

      // Map current variant's option values to selectedOptions format
      // Format: { optionName: value }
      if (orderProduct.variant?.optionValues) {
        const optionsMap: Record<string, string> = {};
        orderProduct.variant.optionValues.forEach((ov) => {
          if (ov.option?.name) {
            // Use value or label as the selected value
            optionsMap[ov.option.name] = ov.value || ov.label || "";
          }
        });
        setSelectedOptions(optionsMap);
      } else {
        setSelectedOptions({});
      }

      // Set found variant to current variant if exists
      if (variantData) {
        setFoundVariant({
          id: variantData.id,
          sku: variantData.sku,
          qr_code: variantData.qr_code,
          price: variantData.price,
          stock: variantData.stock,
          image: variantData.image,
          optionValues:
            variantData.optionValues?.map((ov: any) => ({
              id: ov.id,
              label: ov.label,
              value: ov.value,
            })) || [],
        });
      } else {
        setFoundVariant(null);
      }
    }
  }, [open, orderProduct, variantData]);

  // Find variant when options change
  useEffect(() => {
    if (
      open &&
      productData &&
      selectedOptions &&
      Object.keys(selectedOptions).length > 0
    ) {
      // Check if all required options are selected before making API call
      const allOptionsSelected = productData.options?.every(
        (option: any) => selectedOptions[option.name]
      );

      if (allOptionsSelected) {
        findMatchingVariant(productData, selectedOptions);
      } else {
        setFoundVariant(null);
      }
    } else if (
      open &&
      productData &&
      Object.keys(selectedOptions).length === 0
    ) {
      // If no options selected and product has no options, clear variant
      if (!productData.options || productData.options.length === 0) {
        setFoundVariant(null);
      }
    }
  }, [open, productData, selectedOptions, findMatchingVariant]);

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleUpdate = () => {
    // Validate quantity
    const qty = parseInt(quantity, 10);
    if (!quantity.trim() || isNaN(qty) || qty <= 0) {
      toast.error("الرجاء إدخال كمية صحيحة");
      return;
    }

    // If product has options, ensure we have a variant
    if (productData?.options && productData.options.length > 0) {
      if (!foundVariant) {
        toast.error(
          "لم يتم العثور على متغير مطابق. يرجى التحقق من الخيارات المحددة."
        );
        return;
      }
    }

    // Prepare update data
    const updateData: any = {
      quantity: qty,
    };

    // If variant changed, include new variantId
    if (foundVariant && foundVariant.id !== variantId) {
      updateData.variantId = foundVariant.id;
      updateData.productId = finalProductId;
    } else if (!foundVariant && variantId) {
      // If no variant found but had one before, remove variant
      updateData.variantId = null;
      updateData.productId = finalProductId;
    } else if (foundVariant) {
      // Same variant, just update quantity
      updateData.variantId = foundVariant.id;
      updateData.productId = finalProductId;
    } else if (finalProductId) {
      // Product without variant
      updateData.productId = finalProductId;
    }

    updateOrderProduct(
      {
        orderId: orderId,
        productId: orderProduct?.id || "",
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث المنتج بنجاح");
          onSuccess?.();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث المنتج. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleCancel = () => {
    if (orderProduct) {
      setQuantity(orderProduct.quantity?.toString() || "1");
      if (orderProduct.variant?.optionValues) {
        const optionsMap: Record<string, string> = {};
        orderProduct.variant.optionValues.forEach((ov) => {
          if (ov.option?.name) {
            optionsMap[ov.option.name] = ov.value || ov.label || "";
          }
        });
        setSelectedOptions(optionsMap);
      }
    }
    onOpenChange(false);
  };

  const isLoading = isLoadingVariant || isLoadingProduct;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderProduct || !productData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto text-right">
        <DialogHeader>
          <DialogTitle>تعديل منتج الطلب</DialogTitle>
          <DialogDescription>
            قم بتعديل الكمية أو تغيير الخيارات لاختيار متغير مختلف
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="text-sm font-medium mb-2">المنتج:</div>
            <div className="text-sm text-muted-foreground">
              {productData.title || orderProduct.product?.title || "—"}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              الكمية <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              required
              className="text-right"
            />
          </div>

          {/* Option Values */}
          {productData.options && productData.options.length > 0 && (
            <div className="space-y-2">
              <Label>خيارات المنتج</Label>
              <div className="max-h-[300px] overflow-y-auto space-y-4 p-4 rounded-lg border bg-card">
                {productData.options.map((option: any) => {
                  const selectedValue = selectedOptions[option.name];
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="text-sm font-semibold text-muted-foreground text-right">
                        {option.name}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {option.values?.map((value: any) => {
                          const valueStr = value.value || value.label || "";
                          const isSelected = selectedValue === valueStr;
                          return (
                            <Button
                              key={value.id}
                              type="button"
                              variant={isSelected ? "default" : "secondary"}
                              size="sm"
                              onClick={() =>
                                handleOptionSelect(option.name, valueStr)
                              }
                              className="text-right"
                            >
                              {value.label || value.value}
                            </Button>
                          );
                        })}
                      </div>
                      {selectedValue && (
                        <div className="text-xs text-muted-foreground text-right">
                          المحدد حالياً:{" "}
                          <Badge variant="secondary" className="text-xs">
                            {selectedValue}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show found variant info */}
          {isFindingVariant ? (
            <div className="flex items-center justify-center py-4 p-4 rounded-lg border bg-card">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">
                جاري البحث عن المتغير...
              </span>
            </div>
          ) : foundVariant ? (
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm font-medium mb-2">المتغير المحدد:</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">السعر:</span>
                  <span className="text-sm font-semibold">
                    {(foundVariant.price ?? 0).toLocaleString()} د.ع
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    المخزون:
                  </span>
                  <span className="text-sm font-semibold">
                    {foundVariant.stock} قطعة
                  </span>
                </div>
                {foundVariant.optionValues.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {foundVariant.optionValues.map((ov) => (
                      <Badge
                        key={ov.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {ov.label || ov.value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : productData.options && productData.options.length > 0 ? (
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-sm text-muted-foreground text-center">
                يرجى تحديد جميع الخيارات للعثور على المتغير
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" onClick={handleCancel} variant="secondary">
            <X className="size-4 ml-2" />
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              !quantity.trim() ||
              parseInt(quantity, 10) <= 0 ||
              isFindingVariant ||
              (productData.options &&
                productData.options.length > 0 &&
                !foundVariant)
            }
          >
            {isUpdating ? (
              <>
                <Loader2 className="size-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="size-4 ml-2" />
                حفظ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductVariantDialog;
