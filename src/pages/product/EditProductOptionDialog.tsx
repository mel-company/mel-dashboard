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
import { Save, X, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import {
  useFetchProductOption,
  useUpdateProductOption,
  useDeleteProductOption,
  useUpdateProductOptionValue,
  useDeleteProductOptionValue,
} from "@/api/wrappers/product.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionId: string;
};

type OptionValue = {
  id: string;
  value: string;
  label: string;
};

const EditProductOptionDialog = ({ open, onOpenChange, optionId }: Props) => {
  const [name, setName] = useState("");
  const [values, setValues] = useState<OptionValue[]>([]);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState({ value: "", label: "" });

  const {
    data: optionData,
    isLoading,
    refetch,
  } = useFetchProductOption(optionId, open && !!optionId);

  const { mutate: updateOption, isPending: isUpdatingOption } =
    useUpdateProductOption();
  const { mutate: deleteOption, isPending: isDeletingOption } =
    useDeleteProductOption();
  const { mutate: updateValue, isPending: isUpdatingValue } =
    useUpdateProductOptionValue();
  const { mutate: deleteValue, isPending: isDeletingValue } =
    useDeleteProductOptionValue();

  // Load option data when dialog opens
  useEffect(() => {
    if (open && optionData) {
      setName(optionData.name || "");
      setValues(optionData.values || []);
      setEditingValueId(null);
      setNewValue({ value: "", label: "" });
    }
  }, [open, optionData]);

  const handleUpdateOption = () => {
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم الخيار");
      return;
    }

    updateOption(
      {
        id: optionId,
        data: { name: name.trim() },
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث الخيار بنجاح");
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث الخيار. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleDeleteOption = () => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا الخيار؟ سيتم حذف جميع القيم المرتبطة به."
      )
    ) {
      return;
    }

    deleteOption(optionId, {
      onSuccess: () => {
        toast.success("تم حذف الخيار بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الخيار. حاول مرة أخرى."
        );
      },
    });
  };

  const handleStartEditValue = (value: OptionValue) => {
    setEditingValueId(value.id);
    setNewValue({ value: value.value || "", label: value.label || "" });
  };

  const handleCancelEditValue = () => {
    setEditingValueId(null);
    setNewValue({ value: "", label: "" });
  };

  const handleUpdateValue = (valueId: string) => {
    if (!newValue.value.trim() && !newValue.label.trim()) {
      toast.error("الرجاء إدخال قيمة أو تسمية");
      return;
    }

    updateValue(
      {
        id: valueId,
        data: {
          value: newValue.value.trim() || undefined,
          label: newValue.label.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث القيمة بنجاح");
          setEditingValueId(null);
          setNewValue({ value: "", label: "" });
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث القيمة. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleDeleteValue = (valueId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القيمة؟")) {
      return;
    }

    deleteValue(valueId, {
      onSuccess: () => {
        toast.success("تم حذف القيمة بنجاح");
        refetch();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف القيمة. حاول مرة أخرى."
        );
      },
    });
  };

  const handleAddNewValue = () => {
    if (!newValue.value.trim() && !newValue.label.trim()) {
      toast.error("الرجاء إدخال قيمة أو تسمية");
      return;
    }

    // This would require a create endpoint, but for now we'll just show an error
    toast.error("استخدم زر 'إضافة خيار' لإضافة قيم جديدة");
  };

  const isLoadingData = isLoading;
  const isPending =
    isUpdatingOption || isDeletingOption || isUpdatingValue || isDeletingValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل خيار المنتج</DialogTitle>
          <DialogDescription className="text-right">
            قم بتعديل اسم الخيار وقيمه
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Option Name */}
            <div className="space-y-2">
              <label
                htmlFor="option-name"
                className="text-sm font-medium text-right block"
              >
                اسم الخيار
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="option-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: اللون، الحجم"
                  className="flex-1 text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpdateOption}
                  disabled={isPending || !name.trim()}
                  className="gap-2"
                >
                  <Save className="size-4" />
                  حفظ
                </Button>
              </div>
            </div>

            {/* Values List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-right block">
                  قيم الخيار
                </label>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {values.map((value) => (
                  <div
                    key={value.id}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                  >
                    {editingValueId === value.id ? (
                      <>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground text-right block">
                              التسمية
                            </label>
                            <input
                              type="text"
                              value={newValue.label}
                              onChange={(e) =>
                                setNewValue({
                                  ...newValue,
                                  label: e.target.value,
                                })
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
                              value={newValue.value}
                              onChange={(e) =>
                                setNewValue({
                                  ...newValue,
                                  value: e.target.value,
                                })
                              }
                              placeholder="مثال: Red"
                              className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateValue(value.id)}
                            disabled={isPending}
                            className="text-primary"
                          >
                            <Save className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEditValue}
                            disabled={isPending}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {value.label || value.value}
                            </span>
                            {value.label && value.value && (
                              <span className="text-xs text-muted-foreground">
                                ({value.value})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEditValue(value)}
                            disabled={isPending}
                            className="text-primary"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteValue(value.id)}
                            disabled={isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add New Value Section */}
                <div className="p-3 rounded-lg border border-dashed bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground text-right block">
                          التسمية
                        </label>
                        <input
                          type="text"
                          value={newValue.label}
                          onChange={(e) =>
                            setNewValue({ ...newValue, label: e.target.value })
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
                          value={newValue.value}
                          onChange={(e) =>
                            setNewValue({ ...newValue, value: e.target.value })
                          }
                          placeholder="مثال: Red"
                          className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddNewValue}
                      disabled={isPending}
                      className="gap-2"
                    >
                      <Plus className="size-4" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="gap-2"
            disabled={isPending}
            variant="secondary"
          >
            <X className="size-4" />
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleDeleteOption}
            className="gap-2"
            disabled={isPending}
            variant="destructive"
          >
            {isDeletingOption ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                حذف الخيار
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductOptionDialog;
