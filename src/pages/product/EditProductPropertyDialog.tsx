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
import { Save, X, Trash2, Loader2 } from "lucide-react";
import {
  useFetchProperty,
  useUpdateProperty,
  useDeleteProperty,
} from "@/api/wrappers/property.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
};

const EditProductPropertyDialog = ({
  open,
  onOpenChange,
  propertyId,
}: Props) => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const {
    data: propertyData,
    isLoading,
    refetch,
  } = useFetchProperty(propertyId, open && !!propertyId);

  const { mutate: updateProperty, isPending: isUpdating } = useUpdateProperty();
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty();

  // Load property data when dialog opens
  useEffect(() => {
    if (open && propertyData) {
      setName(propertyData.name || "");
      setValue(propertyData.value || "");
    }
  }, [open, propertyData]);

  const handleUpdate = () => {
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم الخاصية");
      return;
    }

    if (!value.trim()) {
      toast.error("الرجاء إدخال قيمة الخاصية");
      return;
    }

    updateProperty(
      {
        id: propertyId,
        data: {
          name: name.trim(),
          value: value.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث الخاصية بنجاح");
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث الخاصية. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm("هل أنت متأكد من حذف هذه الخاصية؟")) {
      return;
    }

    deleteProperty(propertyId, {
      onSuccess: () => {
        toast.success("تم حذف الخاصية بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الخاصية. حاول مرة أخرى."
        );
      },
    });
  };

  const handleCancel = () => {
    if (propertyData) {
      setName(propertyData.name || "");
      setValue(propertyData.value || "");
    }
    onOpenChange(false);
  };

  const isLoadingData = isLoading;
  const isPending = isUpdating || isDeleting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل خاصية المنتج</DialogTitle>
          <DialogDescription className="text-right">
            قم بتعديل اسم الخاصية وقيمتها
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
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
                placeholder="مثال: المادة، العلامة التجارية"
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
                placeholder="مثال: قطن، نايك"
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
              />
            </div>
          </div>
        )}

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
          <Button
            type="button"
            onClick={handleDelete}
            className="gap-2"
            disabled={isPending}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                حذف
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            className="gap-2"
            disabled={isPending || !name.trim() || !value.trim()}
          >
            <Save className="size-4" />
            {isUpdating ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductPropertyDialog;
