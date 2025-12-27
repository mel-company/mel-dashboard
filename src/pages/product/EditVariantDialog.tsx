import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";
import {
  useFetchVariant,
  useUpdateVariant,
} from "@/api/wrappers/variant.wrappers";
import { useFetchProduct } from "@/api/wrappers/product.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
};

const EditVariantDialog = ({ open, onOpenChange, variantId }: Props) => {
  const [sku, setSku] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [selectedOptionValues, setSelectedOptionValues] = useState<string[]>(
    []
  );

  const {
    data: variantData,
    isLoading,
    refetch,
  } = useFetchVariant(variantId, open && !!variantId);

  const { data: productData } = useFetchProduct(
    variantData?.productId || "",
    !!variantData?.productId
  );

  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant();

  // Load variant data when dialog opens
  useEffect(() => {
    if (open && variantData) {
      setSku(variantData.sku || "");
      setQrCode(variantData.qr_code || "");
      setPrice(variantData.price?.toString() || "");
      setStock(variantData.stock?.toString() || "");
      setSelectedOptionValues(
        variantData.optionValues?.map((v: any) => v.id) || []
      );
    }
  }, [open, variantData]);

  const handleOptionValueToggle = (valueId: string) => {
    setSelectedOptionValues((prev) =>
      prev.includes(valueId)
        ? prev.filter((id) => id !== valueId)
        : [...prev, valueId]
    );
  };

  const handleUpdate = () => {
    // Validate SKU
    if (!sku.trim()) {
      toast.error("الرجاء إدخال رمز SKU");
      return;
    }

    // Validate QR code
    if (!qrCode.trim()) {
      toast.error("الرجاء إدخال رمز QR");
      return;
    }

    const variantData = {
      sku: sku.trim(),
      qr_code: qrCode.trim(),
      price: price.trim() ? parseFloat(price.trim()) : undefined,
      stock: stock.trim() ? parseInt(stock.trim(), 10) : undefined,
      optionValueIds:
        selectedOptionValues.length > 0 ? selectedOptionValues : [],
    };

    updateVariant(
      {
        id: variantId,
        data: variantData,
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث المتغير بنجاح");
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث المتغير. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleCancel = () => {
    if (variantData) {
      setSku(variantData.sku || "");
      setQrCode(variantData.qr_code || "");
      setPrice(variantData.price?.toString() || "");
      setStock(variantData.stock?.toString() || "");
      setSelectedOptionValues(
        variantData.optionValues?.map((v: any) => v.id) || []
      );
    }
    onOpenChange(false);
  };

  // Flatten all option values from all options
  const allOptionValues =
    productData?.options?.flatMap(
      (option: any) =>
        option.values?.map((value: any) => ({
          ...value,
          optionName: option.name,
        })) || []
    ) || [];

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل متغير المنتج</DialogTitle>
          <DialogDescription className="text-right">
            قم بتعديل معلومات المتغير
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* SKU */}
          <div className="space-y-2">
            <label
              htmlFor="variant-sku"
              className="text-sm font-medium text-right block"
            >
              رمز SKU <span className="text-destructive">*</span>
            </label>
            <input
              id="variant-sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="مثال: SKU-12345"
              required
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <label
              htmlFor="variant-qr-code"
              className="text-sm font-medium text-right block"
            >
              رمز QR <span className="text-destructive">*</span>
            </label>
            <input
              id="variant-qr-code"
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="مثال: QR-12345"
              required
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="variant-price"
                className="text-sm font-medium text-right block"
              >
                السعر (اختياري)
              </label>
              <input
                id="variant-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="variant-stock"
                className="text-sm font-medium text-right block"
              >
                المخزون (اختياري)
              </label>
              <input
                id="variant-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
              />
            </div>
          </div>

          {/* Option Values */}
          {allOptionValues.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">
                قيم الخيارات (اختياري)
              </label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 p-3 rounded-lg border bg-card">
                {productData?.options?.map((option: any) => (
                  <div key={option.id} className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground text-right">
                      {option.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values?.map((value: any) => (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => handleOptionValueToggle(value.id)}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            selectedOptionValues.includes(value.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-secondary border-input"
                          }`}
                        >
                          {value.label || value.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            onClick={handleCancel}
            className="gap-2"
            disabled={isUpdating}
            variant="secondary"
          >
            <X className="size-4" />
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            className="gap-2"
            disabled={isUpdating || !sku.trim() || !qrCode.trim()}
          >
            <Save className="size-4" />
            {isUpdating ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVariantDialog;
