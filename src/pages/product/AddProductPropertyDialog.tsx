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
import { Save, X } from "lucide-react";
import { useCreateProperty } from "@/api/wrappers/property.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
};

const AddProductPropertyDialog = ({ open, onOpenChange, productId }: Props) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const { mutate: createProperty, isPending } = useCreateProperty();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate property name
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم الخاصية");
      return;
    }

    // Validate property value
    if (!value.trim()) {
      toast.error("الرجاء إدخال قيمة الخاصية");
      return;
    }

    const propertyData = {
      name: name.trim(),
      value: value.trim(),
      productId,
    };

    createProperty(propertyData, {
      onSuccess: () => {
        toast.success("تم إضافة الخاصية بنجاح");
        // Reset form
        setName("");
        setValue("");
        // Close dialog
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة الخاصية. حاول مرة أخرى."
        );
      },
    });
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة خاصية جديدة</DialogTitle>
          <DialogDescription className="text-right">
            املأ المعلومات التالية لإضافة خاصية جديدة للمنتج
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Name */}
          <div className="space-y-2">
            <label
              htmlFor="property-name"
              className="text-sm font-medium text-right block"
            >
              اسم الخاصية
            </label>
            <input
              id="property-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: المادة، العلامة التجارية، الجنس"
              required
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* Property Value */}
          <div className="space-y-2">
            <label
              htmlFor="property-value"
              className="text-sm font-medium text-right block"
            >
              قيمة الخاصية
            </label>
            <input
              id="property-value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="مثال: قطن، نايك، للجنسين"
              required
              className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={handleCancel}
              className="gap-2"
              disabled={isPending}
              variant="secondary"
            >
              <X className="size-4" />
              إلغاء
            </Button>
            <Button type="submit" className="gap-2" disabled={isPending}>
              <Save className="size-4" />
              {isPending ? "جاري الحفظ..." : "حفظ الخاصية"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductPropertyDialog;
