import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { useCreateProductOption } from "@/api/wrappers/product.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
};

type OptionValue = {
  value: string;
  label: string;
};

const AddProductOptionDialog = ({ open, onOpenChange, productId }: Props) => {
  const [name, setName] = useState("");
  const [values, setValues] = useState<OptionValue[]>([
    { value: "", label: "" },
  ]);

  const { mutate: createProductOption, isPending } = useCreateProductOption();

  const handleAddValue = () => {
    setValues([...values, { value: "", label: "" }]);
  };

  const handleRemoveValue = (index: number) => {
    if (values.length > 1) {
      setValues(values.filter((_, i) => i !== index));
    }
  };

  const handleValueChange = (
    index: number,
    field: "value" | "label",
    newValue: string
  ) => {
    const updatedValues = values.map((val, i) =>
      i === index ? { ...val, [field]: newValue } : val
    );
    setValues(updatedValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate option name
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم الخيار");
      return;
    }

    // Filter out empty values and validate
    const validValues = values.filter(
      (val) => val.value.trim() || val.label.trim()
    );

    if (validValues.length === 0) {
      toast.error("الرجاء إدخال قيمة واحدة على الأقل");
      return;
    }

    // Ensure all valid values have both value and label
    const formattedValues = validValues.map((val) => ({
      value: val.value.trim() || val.label.trim(),
      label: val.label.trim() || val.value.trim(),
    }));

    const optionData = {
      name: name.trim(),
      productId,
      values: formattedValues,
    };

    createProductOption(optionData, {
      onSuccess: () => {
        toast.success("تم إضافة الخيار بنجاح");
        // Reset form
        setName("");
        setValues([{ value: "", label: "" }]);
        // Close dialog
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة الخيار. حاول مرة أخرى."
        );
      },
    });
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setValues([{ value: "", label: "" }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة خيار جديد</DialogTitle>
          <DialogDescription className="text-right">
            املأ المعلومات التالية لإضافة خيار جديد للمنتج
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Option Name */}
          <div className="space-y-2">
            <label
              htmlFor="option-name"
              className="text-sm font-medium text-right block"
            >
              اسم الخيار
            </label>
            <input
              id="option-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: اللون، الحجم"
              required
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* Values List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-right block">
                قيم الخيار
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddValue}
                className="gap-2"
              >
                <Plus className="size-4" />
                إضافة قيمة
              </Button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground text-right block">
                        التسمية
                      </label>
                      <input
                        type="text"
                        value={value.label}
                        onChange={(e) =>
                          handleValueChange(index, "label", e.target.value)
                        }
                        placeholder="مثال: أحمر"
                        className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground text-right block">
                        القيمة
                      </label>
                      <input
                        type="text"
                        value={value.value}
                        onChange={(e) =>
                          handleValueChange(index, "value", e.target.value)
                        }
                        placeholder="مثال: Red"
                        className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveValue(index)}
                    disabled={values.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={handleCancel}
              className="gap-2"
              disabled={isPending}
            >
              <X className="size-4" />
              إلغاء
            </Button>
            <Button type="submit" className="gap-2" disabled={isPending}>
              <Save className="size-4" />
              {isPending ? "جاري الحفظ..." : "حفظ الخيار"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductOptionDialog;
